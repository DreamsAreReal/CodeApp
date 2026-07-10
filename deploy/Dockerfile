# Single-origin image: one container serves the Vite frontend AND the ASP.NET /api.
# Build context = repo root:  docker build -f deploy/Dockerfile -t codex .
# Multi-arch base images resolve to arm64 automatically on Oracle Ampere / any ARM host.

# ---- stage 1: build the frontend as a RELATIVE (same-origin) bundle ----
FROM node:22-alpine AS frontend
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci
COPY app/ ./
# build:deploy = `VITE_API_BASE= vite build --outDir dist-deploy` -> relative /api calls
RUN npm run build:deploy

# ---- stage 2: publish the .NET backend, embedding the frontend as wwwroot ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /src
COPY backend/Codex.Backend/Codex.Backend.csproj ./Codex.Backend/
RUN dotnet restore ./Codex.Backend/Codex.Backend.csproj
COPY backend/Codex.Backend/ ./Codex.Backend/
# single origin: the built frontend becomes the backend's wwwroot
COPY --from=frontend /app/dist-deploy ./Codex.Backend/wwwroot
RUN dotnet publish ./Codex.Backend/Codex.Backend.csproj -c Release -o /publish

# ---- stage 3: runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=backend /publish ./
# Production turns off DevMode (no /api/dev/*, no run-csharp). Listen on all interfaces
# inside the container; the reverse proxy (Caddy) terminates TLS and forwards here.
# SQLite lives on a mounted volume so the FSRS schedule survives restarts/redeploys.
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://0.0.0.0:8080 \
    Database__Path=/data/codex.db
EXPOSE 8080
VOLUME ["/data"]
# Telegram__BotToken is injected at runtime (compose env / --env). Never baked into the image.
ENTRYPOINT ["dotnet", "Codex.Backend.dll"]
