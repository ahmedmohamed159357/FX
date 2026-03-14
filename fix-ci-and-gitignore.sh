#!/usr/bin/env bash
set -euo pipefail

# This script is intended to reproduce the workspace CI/gitignore fixes
# applied in this branch. It is safe to run multiple times.

cd "$(dirname "$0")"

timestamp() {
  date -u +"%Y%m%dT%H%M%SZ"
}

backup_file() {
  local path="$1"
  if [ -f "$path" ]; then
    local bak="${path}.bak.$(timestamp)"
    cp -p "$path" "$bak"
    echo "Backed up $path -> $bak"
  fi
}

# 1) Fix .gitignore to cover common Node/Vite/VSC artifacts.
backup_file ".gitignore"
cat > .gitignore <<'EOF'
.env
.env.*.local
.DS_Store
.vscode/
.idea/

# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
logs/
*.log

# Coverage
coverage/
EOF

# 2) Guard GitHub Actions workflows: skip steps when app/backend directories are missing.
backup_file ".github/workflows/build-and-smoke.yml"
cat > .github/workflows/build-and-smoke.yml <<'EOF'
name: Build & Smoke Tests

on:
  push:
    branches: [ feat/prod-nuclear-setup, main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    env:
      NODE_VERSION: '18'

    steps:
      # ── Checkout ────────────────────────────────────────────────────
      - name: Checkout
        uses: actions/checkout@v4

      - name: Detect workspace directories
        id: workspace-check
        run: |
          echo "backend_exists=$(if [ -d backend ]; then echo true; else echo false; fi)" >> $GITHUB_OUTPUT
          echo "app_exists=$(if [ -d app ]; then echo true; else echo false; fi)" >> $GITHUB_OUTPUT

      # ── Node.js ─────────────────────────────────────────────────────
      - name: Setup Node.js ${{ env.NODE_VERSION }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: package-lock.json

      # ── Backend: install & build ────────────────────────────────────
      - name: Backend — npm ci
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: cd backend && npm ci

      - name: Backend — typecheck
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: cd backend && npx tsc --noEmit

      - name: Backend — build
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: cd backend && npm run build

      # ── Frontend: install & build ───────────────────────────────────
      - name: Frontend — npm ci
        if: steps.workspace-check.outputs.app_exists == 'true'
        run: cd app && npm ci

      - name: Frontend — typecheck
        if: steps.workspace-check.outputs.app_exists == 'true'
        run: cd app && npx tsc --noEmit

      - name: Frontend — build
        if: steps.workspace-check.outputs.app_exists == 'true'
        run: cd app && npm run build
        env:
          VITE_API_URL: http://localhost:4002

      # ── Smoke tests ─────────────────────────────────────────────────
      - name: Start backend (background)
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: |
          PORT=4002 NODE_ENV=test ALLOWED_ORIGINS="" \
          node backend/dist/index.js &
          echo "BACKEND_PID=$!" >> $GITHUB_ENV
          sleep 4

      - name: Smoke — GET /health
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: |
          STATUS=$(curl -s -o /tmp/health.json -w "%{http_code}" http://localhost:4002/health)
          echo "Response: $(cat /tmp/health.json)"
          [ "$STATUS" = "200" ] || (echo "❌ /health returned $STATUS" && exit 1)
          grep -q '"ok"' /tmp/health.json || grep -q '"status"' /tmp/health.json || (echo "❌ bad body" && exit 1)
          echo "✅ /health OK"

      - name: Smoke — GET /version
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: |
          STATUS=$(curl -s -o /tmp/version.json -w "%{http_code}" http://localhost:4002/version)
          echo "Response: $(cat /tmp/version.json)"
          [ "$STATUS" = "200" ] || (echo "❌ /version returned $STATUS" && exit 1)
          echo "✅ /version OK"

      - name: Smoke — POST /api/insight (mock mode)
        if: steps.workspace-check.outputs.backend_exists == 'true'
        run: |
          STATUS=$(curl -s -o /tmp/insight.json -w "%{http_code}" \
            -X POST http://localhost:4002/api/insight \
            -H "Content-Type: application/json" \
            -d '{"brief":"Test brief for CI smoke test","language":"en"}')
          echo "Response (first 300 chars): $(cat /tmp/insight.json | head -c 300)"
          [ "$STATUS" = "200" ] || (echo "❌ /api/insight returned $STATUS" && exit 1)
          echo "✅ /api/insight OK"

      - name: Stop backend
        if: always()
        run: kill ${{ env.BACKEND_PID }} 2>/dev/null || true

      # ── Upload build artifacts ───────────────────────────────────────
      - name: Upload backend dist
        if: steps.workspace-check.outputs.backend_exists == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist/
          retention-days: 7

      - name: Upload frontend dist
        if: steps.workspace-check.outputs.app_exists == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: app/dist/
          retention-days: 7

      - name: Upload smoke test logs
        if: steps.workspace-check.outputs.backend_exists == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: smoke-logs
          path: /tmp/*.json
          retention-days: 7
EOF

backup_file ".github/workflows/android-artifact.yml"
cat > .github/workflows/android-artifact.yml <<'EOF'
name: Android APK Build

on:
  push:
    branches: [ feat/prod-nuclear-setup ]
  workflow_dispatch:

# Only runs when CI_ANDROID secret is set to "true"
jobs:
  android-apk:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    if: ${{ secrets.CI_ANDROID == 'true' }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Detect workspace directories
        id: workspace-check
        run: |
          echo "app_exists=$(if [ -d app ]; then echo true; else echo false; fi)" >> $GITHUB_OUTPUT
          echo "android_exists=$(if [ -d app/android ]; then echo true; else echo false; fi)" >> $GITHUB_OUTPUT

      - name: Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: package-lock.json

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      # ── Build frontend ──────────────────────────────────────────────
      - name: Frontend — npm ci
        if: steps.workspace-check.outputs.app_exists == 'true'
        run: cd app && npm ci

      - name: Frontend — build
        if: steps.workspace-check.outputs.app_exists == 'true'
        run: cd app && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      # ── Capacitor sync ──────────────────────────────────────────────
      - name: Capacitor — init & add android
        if: steps.workspace-check.outputs.android_exists == 'true'
        run: |
          cd app
          # Init only if capacitor.config.ts exists (already present)
          npx cap add android || true   # skip if already added
          npx cap sync android

      # ── Gradle cache ────────────────────────────────────────────────
      - name: Cache Gradle
        if: steps.workspace-check.outputs.android_exists == 'true'
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ hashFiles('app/android/**/*.gradle*') }} # uses app/android if present
          restore-keys: gradle-

      # ── Build APK ───────────────────────────────────────────────────
      - name: Build debug APK
        if: steps.workspace-check.outputs.android_exists == 'true'
        run: ./gradlew assembleDebug --no-daemon
        working-directory: app/android

      - name: Upload APK artifact
        if: steps.workspace-check.outputs.android_exists == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: textfx-debug-apk
          path: app/android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14
EOF

# 3) Make script executable
chmod +x fix-ci-and-gitignore.sh

echo "Done." 1>&2
