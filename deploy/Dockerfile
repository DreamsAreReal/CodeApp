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

# curl is not present in the aspnet base image; install it (minimal) for the HEALTHCHECK.
# Kept in a single layer with cleanup so the image stays small.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# The aspnet base image already ships a non-root user `app` (uid/gid 1654); reuse it.
# Create the SQLite data dir up front and hand /data to `app` BEFORE `USER`, so a
# Docker-named volume inherits this ownership and the app can write codex.db there.
RUN mkdir -p /data && chown -R app:app /data

COPY --from=backend --chown=app:app /publish ./

# Production turns off DevMode (no /api/dev/*, no run-csharp). Listen on all interfaces
# inside the container; the reverse proxy (Caddy) terminates TLS and forwards here.
# SQLite lives on a mounted volume so the FSRS schedule survives restarts/redeploys.
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://0.0.0.0:8080 \
    Database__Path=/data/codex.db
EXPOSE 8080
VOLUME ["/data"]

# Drop privileges: the runtime process is the unprivileged `app` user (uid 1654), never root.
USER app

# Liveness/readiness probe for orchestrators and `docker inspect .State.Health`.
# /health/ready also proves the SQLite DB is reachable (SELECT 1). start-period covers
# first-run schema creation; a failing DB flips the container to `unhealthy`.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/health/ready || exit 1

# Telegram__BotToken is injected at runtime (compose env / --env). Never baked into the image.
ENTRYPOINT ["dotnet", "Codex.Backend.dll"]
