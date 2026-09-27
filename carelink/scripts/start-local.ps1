param([switch]$BackendWorker)
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$secretFile = Join-Path $projectRoot ".local-secrets.xml"

function Unprotect-Text($secret) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

if ($BackendWorker) {
    $settings = Import-Clixml -LiteralPath $secretFile
    $env:DB_PASSWORD = Unprotect-Text $settings.DatabasePassword
    $env:JWT_SECRET = Unprotect-Text $settings.JwtSecret
    $env:DB_URL = "jdbc:postgresql://localhost:5433/carelink_database"
    $env:DB_USERNAME = "carelink"
    $env:SPRING_PROFILES_ACTIVE = "dev"
    Set-Location -LiteralPath $projectRoot
    $maven = (Get-Command mvn.cmd -ErrorAction SilentlyContinue).Source
    if (-not $maven) { $maven = Join-Path $projectRoot "mvnw.cmd" }
    & $maven "-Dmaven.repo.local=$env:USERPROFILE\.m2\repository" spring-boot:run
    exit $LASTEXITCODE
}

if (-not (Test-Path -LiteralPath $secretFile)) {
    Write-Host "Enter the existing CareLink database user password, not the PostgreSQL admin password."
    Write-Host "It will be saved encrypted for your Windows account. No database passwords will be changed."
    $password = Read-Host "CareLink database password" -AsSecureString
    $env:PGPASSWORD = Unprotect-Text $password
    try {
        & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -w -h localhost -p 5433 -U carelink -d carelink_database -tAc "SELECT 1" | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Database login failed. Nothing was changed; run this script again with the correct password." }
    } finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
    $bytes = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    $jwt = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
    [pscustomobject]@{
        DatabasePassword = $password
        JwtSecret = (ConvertTo-SecureString $jwt -AsPlainText -Force)
    } | Export-Clixml -LiteralPath $secretFile
}

function Is-Listening([int]$Port) {
    $client = New-Object Net.Sockets.TcpClient
    try { $client.Connect("127.0.0.1", $Port); return $true }
    catch { return $false }
    finally { $client.Dispose() }
}

if (-not (Is-Listening 1327)) {
    Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -WorkingDirectory $projectRoot `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ('"' + $PSCommandPath + '"'), "-BackendWorker") `
        -RedirectStandardOutput (Join-Path $projectRoot "backend-out.log") `
        -RedirectStandardError (Join-Path $projectRoot "backend-err.log")
}
if (-not (Is-Listening 5173)) {
    Start-Process -FilePath "cmd.exe" -WindowStyle Hidden -WorkingDirectory (Join-Path $projectRoot "Frontend") `
        -ArgumentList "/c", "npm run dev -- --host 127.0.0.1" `
        -RedirectStandardOutput (Join-Path $projectRoot "Frontend\frontend-out.log") `
        -RedirectStandardError (Join-Path $projectRoot "Frontend\frontend-err.log")
}
Write-Host "Startup requested. Open http://127.0.0.1:5173 after the backend finishes starting."
