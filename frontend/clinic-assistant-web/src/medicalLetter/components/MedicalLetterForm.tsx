import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import useMedicalLetterApi from "@/medicalLetter/useMedicalLetterApi";
import LetterAttachmentsSection from "@/medicalLetter/components/LetterAttachmentsSection";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import useNotification from "@/shared/NotificationContext";
import type { MedicalLetterResponseDTO } from "@/medicalLetter/props";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const T = MS_LIGHT;

const FieldLabel = ({ children }: { children: string }) => (
  <Typography
    sx={{
      fontSize: "0.71875rem",
      fontWeight: 600,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: T.textMuted,
      fontFamily: MS_FONTS.sans,
      mb: "6px",
    }}
  >
    {children}
  </Typography>
);

const editableSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderStyle: "dashed", borderColor: T.accent },
    "&:hover fieldset": { borderColor: T.accentInk },
    "&.Mui-focused fieldset": { borderStyle: "solid", borderColor: T.accentInk },
  },
} as const;

const readOnlySx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
} as const;

interface Props {
  letter: MedicalLetterResponseDTO;
  readOnly?: boolean;
  onSaved: (updated: MedicalLetterResponseDTO) => void;
}

const MedicalLetterForm = ({ letter, readOnly = false, onSaved }: Props) => {
  const { updateLetter, downloadLetterPdf } = useMedicalLetterApi();
  const navigate = useNavigate();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [location, setLocation] = useState(letter.location);
  const [antecedente, setAntecedente] = useState(letter.antecedente ?? "");
  const [simptome, setSimptome] = useState(letter.simptome ?? "");
  const [clinice, setCLinice] = useState(letter.clinice ?? "");
  const [paraclinice, setParaclinice] = useState(letter.paraclinice ?? "");
  const [diagnostic, setDiagnostic] = useState(letter.diagnostic ?? "");
  const [recomandari, setRecomandari] = useState(letter.recomandari ?? "");

  useEffect(() => {
    setLocation(letter.location);
    setAntecedente(letter.antecedente ?? "");
    setSimptome(letter.simptome ?? "");
    setCLinice(letter.clinice ?? "");
    setParaclinice(letter.paraclinice ?? "");
    setDiagnostic(letter.diagnostic ?? "");
    setRecomandari(letter.recomandari ?? "");
  }, [letter]);

  const handleDownloadPdf = async () => {
    setErrors([]);
    setPdfLoading(true);
    try {
      await downloadLetterPdf(letter.id, `scrisoare-medicala-${letter.id}.pdf`);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSave = async () => {
    setErrors([]);
    setLoading(true);
    try {
      const updated = await updateLetter(letter.id, {
        location,
        antecedente: antecedente || null,
        simptome: simptome || null,
        clinice: clinice || null,
        paraclinice: paraclinice || null,
        diagnostic: diagnostic || null,
        recomandari: recomandari || null,
      });
      onSaved(updated);
      notify("Scrisoarea a fost salvată.", "success");
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  const fields: { label: string; value: string; setter: (v: string) => void; multiline: boolean }[] = [
    { label: "Localitate", value: location, setter: setLocation, multiline: false },
    { label: "Antecedente", value: antecedente, setter: setAntecedente, multiline: true },
    { label: "Simptome", value: simptome, setter: setSimptome, multiline: true },
    { label: "Examen clinic", value: clinice, setter: setCLinice, multiline: true },
    { label: "Examen paraclinic", value: paraclinice, setter: setParaclinice, multiline: true },
    { label: "Diagnostic", value: diagnostic, setter: setDiagnostic, multiline: true },
    { label: "Recomandări", value: recomandari, setter: setRecomandari, multiline: true },
  ];

  return (
    <Box sx={{ maxWidth: 720 }}>
      {/* Header */}
      <Box sx={{ mb: "24px" }}>
        <Typography
          sx={{
            fontFamily: MS_FONTS.serif,
            fontSize: "1.25rem",
            fontWeight: 500,
            color: T.text,
            lineHeight: 1.3,
          }}
        >
          {letter.letterType}
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "4px" }}>
          {letter.doctor.firstName} {letter.doctor.lastName} · {letter.location} ·{" "}
          {new Date(letter.writtenAt).toLocaleDateString("ro-RO")}
          {letter.lastEditedAt ? " (editată)" : ""}
        </Typography>
      </Box>

      <ErrorBanner messages={errors} />

      {/* Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {fields.map(({ label, value, setter, multiline }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            <TextField
              value={value}
              onChange={(e) => setter(e.target.value)}
              disabled={readOnly}
              fullWidth
              size="small"
              multiline={multiline}
              minRows={multiline ? 2 : undefined}
              sx={readOnly ? readOnlySx : editableSx}
            />
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          mt: "28px",
          pt: "20px",
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={pdfLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />}
          disabled={loading || pdfLoading}
          onClick={handleDownloadPdf}
        >
          Descarcă PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          disabled={loading || pdfLoading}
          onClick={() => navigate(`/letters/${letter.id}/preview`)}
        >
          Previzualizare
        </Button>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
            disabled={loading || pdfLoading}
            onClick={handleSave}
            sx={{ ml: "auto" }}
          >
            Salvează
          </Button>
        )}
      </Box>
      <LetterAttachmentsSection
        letterId={letter.id}
        readOnly={readOnly}
      />
    </Box>
  );
};

export default MedicalLetterForm;
