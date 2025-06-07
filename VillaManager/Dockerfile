FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["VillaManager/VillaManager.csproj", "VillaManager/"]
COPY ["VillaManager.Core/VillaManager.Core.csproj", "VillaManager.Core/"]
COPY ["VillaManager.Infrastructure/VillaManager.Infrastructure.csproj", "VillaManager.Infrastructure/"]
RUN dotnet restore "VillaManager/VillaManager.csproj"
COPY . .
WORKDIR "/src/VillaManager"
RUN dotnet build "VillaManager.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VillaManager.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VillaManager.dll"]
