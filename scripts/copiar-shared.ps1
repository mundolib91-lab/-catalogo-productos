# Script para copiar componentes compartidos

Write-Host "Copiando componentes a shared/..." -ForegroundColor Green

# Copiar componentes
$componentes = @(
    "SelectorImagen.jsx",
    "Toast.jsx",
    "DetalleProducto.jsx",
    "UsosProducto.jsx",
    "MenuReportarFaltantes.jsx",
    "FormularioProductoNuevo.jsx",
    "FormularioGrupoRepisa.jsx",
    "FormularioReportarExistente.jsx",
    "MenuHamburguesa.jsx",
    "MenuRegistro.jsx",
    "FormularioLoteProveedor.jsx",
    "FormularioLoteMarca.jsx"
)

foreach ($comp in $componentes) {
    $source = "frontend/src/components/$comp"
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination "shared/components/$comp" -Force
        Write-Host "  ✅ $comp" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $comp no encontrado" -ForegroundColor Yellow
    }
}

# Copiar hooks
Write-Host "`nCopiando hooks a shared/..." -ForegroundColor Green

$hooks = @(
    "useTheme.js",
    "useToast.js"
)

foreach ($hook in $hooks) {
    $source = "frontend/src/hooks/$hook"
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination "shared/hooks/$hook" -Force
        Write-Host "  ✅ $hook" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $hook no encontrado" -ForegroundColor Yellow
    }
}

# Copiar utils
Write-Host "`nCopiando utils a shared/..." -ForegroundColor Green

$utils = @(
    "api.js"
)

foreach ($util in $utils) {
    $source = "frontend/src/utils/$util"
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination "shared/utils/$util" -Force
        Write-Host "  ✅ $util" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $util no encontrado" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Copia de componentes compartidos completada" -ForegroundColor Green
