#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT_DIR/.logs"
mkdir -p "$LOG_DIR"

# default port
PORT="${PORT:-4002}"

echo "==> RUN-LOCAL: starting (root: $ROOT_DIR)"
echo "Logs -> $LOG_DIR"

# Helper to kill background children
pids=()
function finish {
  echo "==> RUN-LOCAL: stopping processes..."
  for pid in "${pids[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "Killing PID $pid"
      kill "$pid" || true
    fi
  done
  exit 0
}
trap finish EXIT

# 1) Backend: install, build, start
if [ -d "$ROOT_DIR/backend" ]; then
  echo "-> Backend detected. Installing deps..."
  (cd "$ROOT_DIR/backend" && npm install)
  echo "-> Building backend..."
  (cd "$ROOT_DIR/backend" && npm run build || true)
  echo "-> Starting backend (port $PORT)..."
  nohup bash -lc "cd '$ROOT_DIR/backend' && node dist/index.js" > "$LOG_DIR/backend.log" 2>&1 &
  pids+=($!)
  echo "   backend PID ${pids[-1]} (logs: $LOG_DIR/backend.log)"
else
  echo "-> No backend folder found at $ROOT_DIR/backend"
fi

# wait a bit for backend to boot
sleep 2

# 2) Frontend: install, build, serve
if [ -d "$ROOT_DIR/app" ]; then
  echo "-> Frontend detected. Installing deps..."
  (cd "$ROOT_DIR/app" && npm install)
  echo "-> Building frontend..."
  (cd "$ROOT_DIR/app" && npm run build)
  echo "-> Serving frontend on port 5173..."
  nohup bash -lc "cd '$ROOT_DIR/app' && npx serve -s dist -l 5173" > "$LOG_DIR/frontend.log" 2>&1 &
  pids+=($!)
  echo "   frontend PID ${pids[-1]} (logs: $LOG_DIR/frontend.log)"
else
  echo "-> No frontend folder found at $ROOT_DIR/app"
fi

echo
echo "==> DONE"
echo "Backend: http://localhost:$PORT"
echo "Frontend: http://localhost:5173"
echo "To stop, press Ctrl+C or run 'kill PID' for listed PIDs."
# keep script running to keep child processes in foreground under trap
wait