# Final cleanup script for any remaining blue/indigo references

$dashboardFile = "frontend\src\pages\Dashboard.jsx"

if (Test-Path $dashboardFile) {
    Write-Host "Fixing Dashboard loading dots..."
    $content = Get-Content $dashboardFile -Raw
    
    # Fix loading dots specifically
    $content = $content -replace 'loading-dot bg-blue-600', 'loading-dot bg-primary-600'
    
    Set-Content $dashboardFile $content -NoNewline
    Write-Host "  Updated Dashboard.jsx"
} else {
    Write-Host "  Dashboard.jsx not found"
}

Write-Host ""
Write-Host "Final cleanup complete!"
