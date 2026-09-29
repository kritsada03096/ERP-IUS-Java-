$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/use-java.ps1"
if (!$env:DB_URL -and (Test-Path -LiteralPath (Join-Path $projectRoot '.tools/pgdata/PG_VERSION'))) {
    $env:DB_URL = 'jdbc:postgresql://localhost:5433/company_erp'
    Write-Host 'Using project portable PostgreSQL on port 5433.'
}
Push-Location (Join-Path $projectRoot 'backend/erp-api')
try {
    $env:MAVEN_USER_HOME = Join-Path $projectRoot '.tools/maven'
    & .\mvnw.cmd "-Dmaven.repo.local=$projectRoot/.tools/m2" spring-boot:run
    if ($LASTEXITCODE -ne 0) { throw "Backend exited with code $LASTEXITCODE" }
} finally { Pop-Location }
