$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pgBin = Join-Path $projectRoot '.tools/pgsql/bin'
$pgData = Join-Path $projectRoot '.tools/pgdata'
if (!(Test-Path -LiteralPath "$pgData/PG_VERSION")) { throw 'No project PostgreSQL data directory.' }
& "$pgBin/pg_ctl.exe" -D $pgData -m fast -w stop
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL did not stop cleanly; check .tools/postgres.log.' }
