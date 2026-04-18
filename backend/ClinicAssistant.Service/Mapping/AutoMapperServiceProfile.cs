using AutoMapper;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Service.Mapping;

public class AutoMapperServiceProfile : Profile
{
    public AutoMapperServiceProfile()
    {
        CreateMap<DoctorPostDTO, Doctor>()
            .ForMember(d => d.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(d => d.PasswordHash, opt => opt.Ignore());

        CreateMap<PatientPostDTO, Patient>()
            .ForMember(p => p.UserName, opt => opt.MapFrom(src => src.Email))
            .ForMember(p => p.PasswordHash, opt => opt.Ignore())
            .ForMember(p => p.BirthDate, opt => opt.MapFrom(src => DateTime.SpecifyKind(src.BirthDate, DateTimeKind.Utc)));

        CreateMap<MedicalLetterPutDTO, MedicalLetter>()
            .ForMember(m => m.WrittenAt, opt => opt.Ignore())
            .ForMember(m => m.LastEditedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
    }
}
