$ErrorActionPreference = "Stop"

$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$projectRoot = Split-Path -Parent $PSScriptRoot

function Read-PlainSecret([string]$prompt) {
    $secure = Read-Host $prompt -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

Write-Host "CareLink local PostgreSQL setup" -ForegroundColor Cyan
Write-Host "Your passwords are used only on this computer and are not written to the project files."
$postgresPassword = Read-PlainSecret "Enter the PostgreSQL 'postgres' password you chose during installation"
$carelinkPassword = Read-PlainSecret "Choose a new password for the CareLink database user"
$seedDoctorPassword = Read-PlainSecret "Choose a development password for the sample doctor accounts"
$seedAdminPassword = Read-PlainSecret "Choose a development password for the sample clinic administrator"

$escapedCarelinkPassword = $carelinkPassword.Replace("'", "''")
$env:PGPASSWORD = $postgresPassword

try {
    $roleExists = & $psql -h localhost -p 5433 -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname = 'carelink';"
    if (-not $roleExists) {
        & $psql -h localhost -p 5433 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE ROLE carelink WITH LOGIN PASSWORD '$escapedCarelinkPassword';"
    }
    else {
        & $psql -h localhost -p 5433 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "ALTER ROLE carelink WITH LOGIN PASSWORD '$escapedCarelinkPassword';"
    }

    $databaseExists = & $psql -h localhost -p 5433 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'carelink_database';"
    if (-not $databaseExists) {
        & $psql -h localhost -p 5433 -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE carelink_database OWNER carelink;"
    }
}
finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

$jwtBytes = New-Object byte[] 32
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
    $random.GetBytes($jwtBytes)
}
finally {
    $random.Dispose()
}
$jwtSecret = ($jwtBytes | ForEach-Object { $_.ToString("x2") }) -join ""

$env:SPRING_PROFILES_ACTIVE = "dev"
$env:DB_URL = "jdbc:postgresql://localhost:5433/carelink_database"
$env:DB_USERNAME = "carelink"
$env:DB_PASSWORD = $carelinkPassword
$env:JWT_SECRET = $jwtSecret
$env:CARELINK_SEED_ENABLED = "true"
$env:CARELINK_SEED_DOCTOR_PASSWORD = $seedDoctorPassword
$env:CARELINK_SEED_ADMIN_PASSWORD = $seedAdminPassword

$existingBackend = Get-NetTCPConnection -LocalPort 1327 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
if ($existingBackend) {
    Stop-Process -Id $existingBackend.OwningProcess -Force
    Start-Sleep -Seconds 1
}

Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", ".\mvnw.cmd spring-boot:run" `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $projectRoot "backend-out.log") `
    -RedirectStandardError (Join-Path $projectRoot "backend-err.log")

Write-Host "CareLink database created and backend startup requested." -ForegroundColor Green
Write-Host "You can close this window. The React site remains available in the browser."
