$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/use-java.ps1"
Push-Location (Join-Path $projectRoot 'backend/erp-api')
try {
    $env:MAVEN_USER_HOME = Join-Path $projectRoot '.tools/maven'
    & .\mvnw.cmd "-Dmaven.repo.local=$projectRoot/.tools/m2" -B -ntp verify
    if ($LASTEXITCODE -ne 0) { throw "Tests failed with code $LASTEXITCODE" }
} finally { Pop-Location }
