using ClinicAssistant.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ClinicAssistant.Service;

public class MedicalLetterPdfGenerator
{
    public byte[] Generate(MedicalLetter letter)
    {
        var patient = letter.Session.Patient;
        var doctor = letter.Session.Doctor;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(column =>
                {
                    column.Item().Row(row =>
                    {
                        row.ConstantItem(48).Height(48)
                            .Background(Colors.Grey.Lighten2)
                            .AlignCenter().AlignMiddle()
                            .Text(t =>
                            {
                                t.DefaultTextStyle(s => s.FontSize(20).Bold().FontColor(Colors.Grey.Darken2));
                                t.Span("M");
                            });
                        row.RelativeItem().PaddingLeft(10).Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.DefaultTextStyle(s => s.FontSize(16).Bold());
                                t.Span("MediScribe");
                            });
                            col.Item().Text(t =>
                            {
                                t.DefaultTextStyle(s => s.FontSize(9).FontColor(Colors.Grey.Darken1));
                                t.Span("Asistent consultații medicale");
                            });
                        });
                    });
                    column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                });

                page.Content().Column(column =>
                {
                    column.Item().PaddingTop(10).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.Span("Tip scrisoare: ").Bold();
                                t.Span(letter.LetterType);
                            });
                            col.Item().Text(t =>
                            {
                                t.Span("Locație: ").Bold();
                                t.Span(letter.Location);
                            });
                        });
                        row.ConstantItem(130).Column(col =>
                        {
                            col.Item().AlignRight().Text(t =>
                            {
                                t.Span("Data: ").Bold();
                                t.Span(letter.WrittenAt.ToString("dd.MM.yyyy"));
                            });
                        });
                    });

                    column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

                    column.Item().PaddingTop(10).Text(t =>
                    {
                        t.DefaultTextStyle(s => s.FontSize(12).Bold());
                        t.Span("Date pacient");
                    });

                    column.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.Span("Nume: ").Bold();
                                t.Span($"{patient.LastName} {patient.FirstName}");
                            });
                            col.Item().Text(t =>
                            {
                                t.Span("CNP: ").Bold();
                                t.Span(patient.IdentityNumber);
                            });
                            col.Item().Text(t =>
                            {
                                t.Span("Email: ").Bold();
                                t.Span(patient.Email ?? "-");
                            });
                        });
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.Span("Data nașterii: ").Bold();
                                t.Span(patient.BirthDate.ToString("dd.MM.yyyy"));
                            });
                            col.Item().Text(t =>
                            {
                                t.Span("Telefon: ").Bold();
                                t.Span(patient.PhoneNumber ?? "-");
                            });
                        });
                    });

                    column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

                    var fields = new (string Label, string? Value)[]
                    {
                        ("Antecedente", letter.Antecedente),
                        ("Simptome", letter.Simptome),
                        ("Examen clinic", letter.Clinice),
                        ("Examen paraclinic", letter.Paraclinice),
                        ("Diagnostic", letter.Diagnostic),
                        ("Recomandări", letter.Recomandari),
                    };

                    foreach (var (label, value) in fields)
                    {
                        if (string.IsNullOrWhiteSpace(value))
                        {
                            continue;
                        }

                        column.Item().PaddingTop(10).Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.DefaultTextStyle(s => s.Bold());
                                t.Span(label);
                            });
                            col.Item().PaddingTop(2).Text(value);
                        });
                    }

                    column.Item().PaddingTop(24).ShowEntire().BorderTop(1).BorderColor(Colors.Grey.Lighten1).PaddingTop(8).Row(row =>
                    {
                        row.RelativeItem().AlignBottom().Text(t =>
                        {
                            t.Span("Data: ").Bold();
                            t.Span(letter.WrittenAt.ToString("dd.MM.yyyy"));
                        });
                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text(t =>
                            {
                                t.DefaultTextStyle(s => s.Bold());
                                t.Span("Semnătura specialist:");
                            });
                            col.Item().Text($"Dr. {doctor.FirstName} {doctor.LastName}");
                            col.Item().PaddingTop(18).Text("______________________________");
                        });
                    });
                });
            });
        }).GeneratePdf();
    }
}
