#!/bin/sh
# Substitute the PORT environment variable into the nginx configuration
sed -i "s/listen 7860;/listen ${PORT:-7860};/" /etc/nginx/conf.d/default.conf

# Start the backend in the background
cd /app && uvicorn backend.main:app --host 127.0.0.1 --port 8000 &

# Start nginx in the foreground
nginx -g 'daemon off;'
