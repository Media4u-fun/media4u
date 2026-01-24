# Kill all Node and npm processes
Write-Host "Killing all Node.js and npm processes..." -ForegroundColor Yellow

# Get all node.exe and npm processes
$processes = Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue

if ($processes) {
    foreach ($process in $processes) {
        Write-Host "Killing process: $($process.Name) (PID: $($process.Id))"
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "All Node/npm processes killed" -ForegroundColor Green
} else {
    Write-Host "No Node/npm processes found" -ForegroundColor Green
}

# Kill any process still holding port 3000
Write-Host "`nClearing port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($port3000) {
    Write-Host "Found process using port 3000 (PID: $($port3000.OwningProcess))"
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Port 3000 cleared" -ForegroundColor Green
} else {
    Write-Host "Port 3000 is free" -ForegroundColor Green
}

# Clear npm cache
Write-Host "`nClearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "npm cache cleared" -ForegroundColor Green

Write-Host "`nAll cleanup complete! You can now run: npm run dev" -ForegroundColor Cyan
