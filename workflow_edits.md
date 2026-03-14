# Workflow edits (CI conditionals)

## build-and-smoke.yml

- Added a `Detect workspace directories` step to set `backend_exists` and `app_exists` outputs.
- Guarded backend steps (`npm ci`, `tsc`, `build`, start server, smoke tests, artifact upload) with `if: steps.workspace-check.outputs.backend_exists == 'true'`.
- Guarded frontend steps (`npm ci`, `tsc`, `build`, artifact upload) with `if: steps.workspace-check.outputs.app_exists == 'true'`.
- Ensures the workflow does not fail when `backend/` or `app/` directories are missing from the repository.
- Updated node cache configuration to use the root `package-lock.json`.
- Updated all working-directory and path references to remove `FX/` prefix (now uses `backend/` and `app/` directly).

## android-artifact.yml

- Added a `Detect workspace directories` step to set `app_exists` and `android_exists` outputs.
- Guarded frontend build steps with `if: steps.workspace-check.outputs.app_exists == 'true'`.
- Guarded Capacitor/Gradle build steps with `if: steps.workspace-check.outputs.android_exists == 'true'`.
- Guarded artifact upload step so the workflow is a no-op when `app/android` is missing.
- Updated Node cache configuration to use `app/package-lock.json`.
- Updated all working-directory and path references to remove `FX/` prefix (now uses `app/` directly).
