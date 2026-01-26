# Script para copiar frontend a apps/mundolib-app

Write-Host "Copiando frontend a apps/mundolib-app..." -ForegroundColor Green

# Copiar todo el directorio frontend
Copy-Item -Path "frontend" -Destination "apps/mundolib-app" -Recurse -Force

Write-Host "✅ Copia completada" -ForegroundColor Green
Write-Host "Verificando..." -ForegroundColor Yellow

# Verificar que se copió
if (Test-Path "apps/mundolib-app/src") {
    Write-Host "✅ apps/mundolib-app/src existe" -ForegroundColor Green
} else {
    Write-Host "❌ Error: apps/mundolib-app/src no existe" -ForegroundColor Red
}

if (Test-Path "apps/mundolib-app/package.json") {
    Write-Host "✅ apps/mundolib-app/package.json existe" -ForegroundColor Green
} else {
    Write-Host "❌ Error: apps/mundolib-app/package.json no existe" -ForegroundColor Red
}
