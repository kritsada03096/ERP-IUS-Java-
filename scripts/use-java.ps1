$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$portableJdk = Join-Path $projectRoot '.tools/jdk21'
if (Test-Path -LiteralPath $portableJdk) {
    $jdk = Get-ChildItem -LiteralPath $portableJdk -Directory | Select-Object -First 1
    if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
}
if ($env:JAVA_HOME) { $env:Path = "$env:JAVA_HOME\bin;$env:Path" }
$javaVersion = (& java --version | Out-String)
if ($javaVersion -notmatch '(?:openjdk|java) (21|2[2-5])\.') {
    throw 'JDK 21-25 is required. Install JDK 21 and set JAVA_HOME, or put it under .tools/jdk21/.'
}
