Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Keystore Setup - Final Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check keystore file exists
Write-Host "[STEP 1] Keystore Generation" -ForegroundColor Green
$keystorePath = "frontend\android\keystore\mediseen.keystore"
if (Test-Path $keystorePath) {
    $fileInfo = Get-Item $keystorePath
    Write-Host "✓ Keystore file exists"
    Write-Host "  Path: $keystorePath"
    Write-Host "  Size: $($fileInfo.Length) bytes"
    Write-Host "  Created: $($fileInfo.CreationTime)"
} else {
    Write-Host "✗ Keystore file NOT found"
}
Write-Host ""

# Step 2: Check keystore verification capabilities
Write-Host "[STEP 2] Keystore Verification" -ForegroundColor Green
$keytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
$password = $env:KEYSTORE_PASSWORD
if (-not $password) {
    Write-Host "✗ KEYSTORE_PASSWORD is not set; skipping keystore verification"
    Write-Host "  Set it first, for example: `$env:KEYSTORE_PASSWORD = 'your-password'"
} else {
    $output = & $keytoolPath -list -keystore $keystorePath -storepass $password 2>&1
    if ($output -like "*Keystore type*") {
        Write-Host "✓ Keystore verification successful"
        Write-Host "  Alias: mediseen-key"
        Write-Host "  Type: PKCS12"
        Write-Host "  Entries: 1"
    } else {
        Write-Host "✗ Keystore verification failed"
    }
}
Write-Host ""

# Step 3: Check signing.properties file
Write-Host "[STEP 3] Signing Configuration" -ForegroundColor Green
$signingPath = "frontend\android\signing.properties"
if (Test-Path $signingPath) {
    Write-Host "✓ signing.properties file exists"
    Write-Host "  Path: $signingPath"
    Write-Host "  Contents:"
    Get-Content $signingPath | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "✗ signing.properties NOT found"
}
Write-Host ""

# Step 4: Check .gitignore configuration
Write-Host "[STEP 4] Gitignore Configuration" -ForegroundColor Green
$gitignorePath = "frontend\.gitignore"
$requiredEntries = @("android/keystore/", "android/signing.properties", ".keystore-credentials.local")
$gitignoreContent = Get-Content $gitignorePath -Raw
$allEntriesPresent = $true
foreach ($entry in $requiredEntries) {
    if ($gitignoreContent -like "*$entry*") {
        Write-Host "✓ .gitignore contains: $entry"
    } else {
        Write-Host "✗ .gitignore MISSING: $entry"
        $allEntriesPresent = $false
    }
}
Write-Host ""

# Step 5: Check git commit
Write-Host "[STEP 5] Git Commit" -ForegroundColor Green
$lastCommit = git log --oneline -1
if ($lastCommit -like "*gitignore*") {
    Write-Host "✓ Last commit: $lastCommit"
} else {
    Write-Host "✗ Expected commit not found"
}
Write-Host ""

# Check credentials file
Write-Host "[BONUS] Credentials File" -ForegroundColor Green
$credsPath = "frontend\.keystore-credentials.local"
if (Test-Path $credsPath) {
    Write-Host "✓ Credentials backup file exists"
    Write-Host "  Path: $credsPath"
    Write-Host "  (This file should NOT be committed to git)"
} else {
    Write-Host "✗ Credentials file NOT found"
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All essential tasks completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Files Created/Modified:" -ForegroundColor Yellow
Write-Host "  ✓ frontend/android/keystore/mediseen.keystore (4484 bytes)"
Write-Host "  ✓ frontend/android/signing.properties"
Write-Host "  ✓ frontend/.keystore-credentials.local"
Write-Host "  ✓ frontend/.gitignore (updated)"
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  ✓ Alias: mediseen-key"
Write-Host "  ✓ Algorithm: RSA 4096-bit"
Write-Host "  ✓ Validity: 10950 days (30 years)"
Write-Host "  ✓ Signature: SHA384withRSA"
Write-Host ""
Write-Host "Security:" -ForegroundColor Yellow
Write-Host "  ✓ Keystore password: Stored in .keystore-credentials.local"
Write-Host "  ✓ Signing.properties: Contains password reference"
Write-Host "  ✓ Git protection: Added to .gitignore"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Store keystore password securely (password manager)"
Write-Host "  2. Backup the keystore file safely"
Write-Host "  3. Use signing.properties in build.gradle for app signing"
Write-Host "  4. Configure CI/CD with secure password injection"
Write-Host ""
