# Generate secure random password
$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
$keystorePassword = -join ((0..31) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })

$keystorePath = "frontend\android\keystore\mediseen.keystore"
$dname = 'CN=Explainable-Med Medical Diagnostics, OU=Medical AI, O=HackMatrix Team, L=India, S=India, C=IN'

Write-Host "Starting keystore generation..."
Write-Host "Keystore path: $keystorePath"
Write-Host "Distinguished Name: $dname"

# Create keystore
$keytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
$output = & $keytoolPath -genkey -v `
    -keystore $keystorePath `
    -keyalg RSA `
    -keysize 4096 `
    -validity 10950 `
    -alias mediseen-key `
    -dname $dname `
    -storepass $keystorePassword `
    -keypass $keystorePassword 2>&1

Write-Host $output

# Verify keystore
Write-Host ""
Write-Host "Verifying keystore was created..."
if (Test-Path $keystorePath) {
    Write-Host "SUCCESS: Keystore file created at $keystorePath"
    $fileInfo = Get-Item $keystorePath
    Write-Host "File size: $($fileInfo.Length) bytes"
    Write-Host "Modified: $($fileInfo.LastWriteTime)"
    
    # Save credentials
    $credentialsFile = "frontend\.keystore-credentials.local"
    $credentialsContent = @"
# Android Keystore Credentials (NOT for Git)
**DO NOT COMMIT THIS FILE**

## Keystore Details
- File: frontend/android/keystore/mediseen.keystore
- Alias: mediseen-key
- Algorithm: RSA
- Key Size: 4096 bits
- Validity: 10950 days (30 years)
- Organization: HackMatrix Team

## Credentials
Keystore Password: $keystorePassword
Key Password: $keystorePassword

## Setup Date
Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Security
This password should be:
1. Stored securely (password manager recommended)
2. Never committed to git
3. Shared securely with team members who need it
"@
    
    $credentialsContent | Out-File -FilePath $credentialsFile -Encoding UTF8
    Write-Host "Credentials saved to: $credentialsFile"
    Write-Host ""
    Write-Host "PASSWORD FOR SIGNING.PROPERTIES: $keystorePassword"
} else {
    Write-Host "ERROR: Keystore file was not created!"
    exit 1
}
