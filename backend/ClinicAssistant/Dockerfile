FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution + csproj files separately for NuGet restore layer caching
COPY ClinicAssistant/ClinicAssistant.sln ClinicAssistant/
COPY ClinicAssistant/ClinicAssistant.csproj ClinicAssistant/
COPY ClinicAssistant.Controller/ClinicAssistant.Controller.csproj ClinicAssistant.Controller/
COPY ClinicAssistant.Service/ClinicAssistant.Service.csproj ClinicAssistant.Service/
COPY ClinicAssistant.Repository/ClinicAssistant.Repository.csproj ClinicAssistant.Repository/
COPY ClinicAssistant.Domain/ClinicAssistant.Domain.csproj ClinicAssistant.Domain/

RUN dotnet restore ClinicAssistant/ClinicAssistant.sln

COPY . .
RUN dotnet publish ClinicAssistant/ClinicAssistant.csproj -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /publish .

# libgomp1 is required by Whisper.net native libraries on Linux
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*

EXPOSE 5056
ENV ASPNETCORE_URLS=http://+:5056
ENTRYPOINT ["dotnet", "ClinicAssistant.dll"]
