# Summary of Changes

## ✅ What's fixed

- **CI workflow failures** caused by missing `app/` and `backend/` directories (the repo currently lacks those folders). Workflows now detect their presence and skip related steps instead of failing.
- **.gitignore** was rewritten to a standard Node/Vite template, ensuring `node_modules/`, build output, and common editor/OS artifacts are ignored.
- **package-lock.json** was brought back in sync with `package.json` by running `npm install`, allowing `npm ci` to work reliably in CI.

## 🔧 Files modified

- `.gitignore`
- `.github/workflows/build-and-smoke.yml`
- `.github/workflows/android-artifact.yml`
- `package-lock.json`

## 🧪 Validation performed

- Ran `npm install` to update the lockfile.
- Ran `npm ci` successfully to confirm the install works.

## 📌 Notes

- The repository appears to be structured as a workspace (monorepo) with `app/` and `backend/`, but those folders are missing. The CI workflow changes are designed to make the build safe in this state.
- If `app/` and/or `backend/` are added later, these workflows will automatically start running their respective steps.
