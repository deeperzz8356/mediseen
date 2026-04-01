# Hugging Face Docker Space runtime:
# - Serves static Next.js frontend on port 7860 via Nginx
# - Proxies /api and /uploads to FastAPI backend running on 127.0.0.1:8000

FROM node:22-bookworm-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL=/api \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=1
RUN npm run build

FROM python:3.11-slim-bookworm

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_ENV=production \
    ALLOWED_ORIGINS=http://localhost:7860,http://127.0.0.1:7860,https://meediseen-meediseen.hf.space,http://localhost,capacitor://localhost

WORKDIR /app

# Runtime system dependencies for PDF generation + Nginx proxy.
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install -r ./backend/requirements.txt

COPY backend/ ./backend/
COPY model/ ./model/
COPY --from=frontend-builder /app/frontend/out/ /usr/share/nginx/html/
COPY hf/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /app/uploads

EXPOSE 7860

CMD ["sh", "-lc", "uvicorn backend.main:app --host 127.0.0.1 --port 8000 & nginx -g 'daemon off;'"]
