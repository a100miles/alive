# Windows alternative using the operating system certificate store.
# Existing photos are preserved. Run the Python script afterward to refresh the manifest.
$ErrorActionPreference = 'Stop'
$photoDirectory = Join-Path $PSScriptRoot '../frontend/public/media/photos'
$demoPhotos = Get-Content -LiteralPath (Join-Path $photoDirectory 'sources.json') -Raw | ConvertFrom-Json
foreach ($demoPhoto in $demoPhotos) {
    $destination = Join-Path $photoDirectory ($demoPhoto.id + '.jpg')
    if (-not (Test-Path -LiteralPath $destination)) {
        Invoke-WebRequest -Uri $demoPhoto.download -OutFile $destination -TimeoutSec 25
        Write-Output ($demoPhoto.id + ' downloaded')
    }
}
