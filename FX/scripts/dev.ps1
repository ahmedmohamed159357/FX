# PowerShell dev helper: launches backend and app dev servers in separate windows
Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','cd backend; npm run dev' -WindowStyle Normal
Start-Process -FilePath 'powershell' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-Command','cd app; npm run dev' -WindowStyle Normal
Write-Host 'Launched backend and app dev servers (separate windows).'
