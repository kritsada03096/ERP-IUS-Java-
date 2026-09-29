# Uses portable PostgreSQL binaries already extracted under .tools/pgsql.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $projectRoot '.tools/pgsql/bin'
$pgData = Join-Path $projectRoot '.tools/pgdata'
$pgLog = Join-Path $projectRoot '.tools/postgres.log'
if (!(Test-Path -LiteralPath "$pgBin/pg_ctl.exe")) {
    throw 'Portable PostgreSQL not found. Use Docker Compose or install PostgreSQL; see README.'
}
if (Test-Path -LiteralPath "$pgData/postmaster.pid") {
    & "$pgBin/pg_ctl.exe" -D $pgData status
    if ($LASTEXITCODE -eq 0) { Write-Host 'Project PostgreSQL is already running.'; exit 0 }
}
if (Get-NetTCPConnection -State Listen -LocalPort 5433 -ErrorAction SilentlyContinue) {
    throw 'Port 5433 is in use. Stop the conflicting instance or use your own database configuration.'
}
if (!(Test-Path -LiteralPath "$pgData/PG_VERSION")) {
    $passwordFile = Join-Path $projectRoot '.tools/pg-init-password.txt'
    [IO.File]::WriteAllText($passwordFile, 'erp_local', [Text.Encoding]::ASCII)
    try {
        & "$pgBin/initdb.exe" -D $pgData -U erp -E UTF8 --locale=C --auth=scram-sha-256 "--pwfile=$passwordFile"
        if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
    } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
}
# pg_ctl starts its child hidden on Windows.
$process = Start-Process -FilePath "$pgBin/pg_ctl.exe" -ArgumentList @('-D', ('"' + $pgData + '"'), '-l', ('"' + $pgLog + '"'), '-o', '"-h 127.0.0.1 -p 5433"', '-w', 'start') -WindowStyle Hidden -PassThru
$process.WaitForExit()
if ($process.ExitCode -ne 0) { throw "PostgreSQL failed to start. See $pgLog" }
$previousPassword = $env:PGPASSWORD
$env:PGPASSWORD = 'erp_local'
try {
    $exists = & "$pgBin/psql.exe" -h 127.0.0.1 -p 5433 -U erp -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='company_erp'"
    if ($LASTEXITCODE -ne 0) { throw 'Unable to connect to the project PostgreSQL instance.' }
    if ($exists -ne '1') {
        & "$pgBin/createdb.exe" -h 127.0.0.1 -p 5433 -U erp company_erp
        if ($LASTEXITCODE -ne 0) { throw 'Could not create company_erp.' }
    }
} finally { $env:PGPASSWORD = $previousPassword }
Write-Host 'PostgreSQL is ready: localhost:5433/company_erp (erp / erp_local).'
