$keytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
$keystorePath = "frontend\android\keystore\mediseen.keystore"
$password = $env:KEYSTORE_PASSWORD

if (-not $password) {
    Write-Host "ERROR: KEYSTORE_PASSWORD environment variable is not set."
    Write-Host "Set it first, for example: `$env:KEYSTORE_PASSWORD = 'your-password'"
    exit 1
}

Write-Host "Step 2: Verifying keystore..."
$output = & $keytoolPath -list -v -keystore $keystorePath -storepass $password 2>&1
Write-Host $output
Write-Host ""
Write-Host "Step 3: Creating signing.properties file..."

$signingPropsContent = @"
storeFile=../keystore/mediseen.keystore
storePassword=${KEYSTORE_PASSWORD}
keyAlias=mediseen-key
keyPassword=${KEYSTORE_PASSWORD}
"@

$signingPropsPath = "frontend\android\signing.properties"
$signingPropsContent | Out-File -FilePath $signingPropsPath -Encoding ASCII -NoNewline

if (Test-Path $signingPropsPath) {
    Write-Host "SUCCESS: signing.properties created at $signingPropsPath"
    Write-Host ""
    Write-Host "File contents:"
    Get-Content $signingPropsPath
} else {
    Write-Host "ERROR: Could not create signing.properties"
}
