# MediKiosk Production Deployment Automation (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         MediKiosk Production Deployment Launcher        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Database & Backend
Write-Host "`n[1/3] Initializing Database & Starting FastAPI Production Server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; python db_init.py; python -m uvicorn main:app --host 0.0.0.0 --port 8000"

# 2. Build Frontend for Production if needed
if (-not (Test-Path "frontend\.next")) {
    Write-Host "`n[2/3] Building Next.js Optimized Production Bundle..." -ForegroundColor Yellow
    Push-Location frontend
    npm run build
    Pop-Location
} else {
    Write-Host "`n[2/3] Next.js production build ready." -ForegroundColor Green
}

# 3. Start Frontend Production Server
Write-Host "`n[3/3] Starting Next.js Production Web Server on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run start"

Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
Write-Host "Main Portal:       http://localhost:3000" -ForegroundColor Cyan
Write-Host "Admin Dashboard:   http://localhost:3000/admin/dashboard" -ForegroundColor Cyan
Write-Host "Backend API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
