FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution + csproj files separately for NuGet restore layer caching
COPY ClinicAssistant/ClinicAssistant.sln ClinicAssistant/
COPY ClinicAssistant/ClinicAssistant.csproj ClinicAssistant/
COPY ClinicAssistant.Controller/ClinicAssistant.Controller.csproj ClinicAssistant.Controller/
COPY ClinicAssistant.Service/ClinicAssistant.Service.csproj ClinicAssistant.Service/
COPY ClinicAssistant.Repository/ClinicAssistant.Repository.csproj ClinicAssistant.Repository/
COPY ClinicAssistant.Domain/ClinicAssistant.Domain.csproj ClinicAssistant.Domain/

RUN dotnet restore ClinicAssistant/ClinicAssistant.sln -r linux-x64

COPY . .
RUN dotnet publish ClinicAssistant/ClinicAssistant.csproj -c Release -r linux-x64 --self-contained true -o /publish

FROM nvidia/cuda:13.0.0-cudnn-runtime-ubuntu24.04
WORKDIR /app
COPY --from=build /publish .

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 libicu74 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 5056
ENV ASPNETCORE_URLS=http://+:5056
ENTRYPOINT ["./ClinicAssistant"]
