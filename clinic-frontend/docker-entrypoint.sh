#!/bin/sh
set -e
API_URL="${CM_API_URL:-/api/v1}"
FILE_URL="${CM_FILE_URL:-/api/v1/files}"
cat > /usr/share/nginx/html/assets/runtime-config.js <<EOF
window.__CM_API_URL__ = '${API_URL}';
window.__CM_FILE_URL__ = '${FILE_URL}';
EOF
exec nginx -g 'daemon off;'
