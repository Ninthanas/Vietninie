param([string]$Profile = 'local')
$ErrorActionPreference = 'Stop'
$configFile = Join-Path $PSScriptRoot '.env'
if (Test-Path -LiteralPath $configFile) {
    foreach ($line in Get-Content -LiteralPath $configFile) {
        if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim(), 'Process')
        }
    }
}
$env:SPRING_PROFILES_ACTIVE = $Profile
if (-not $env:JWT_SECRET) { throw 'Set JWT_SECRET in backend-java/.env first.' }
$jar = Join-Path $PSScriptRoot 'target/vietninie-api-1.0.0.jar'
if (-not (Test-Path -LiteralPath $jar)) { throw 'Build first with ./mvnw.cmd verify.' }
Push-Location $PSScriptRoot
try {
    $javaExecutable = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin/java.exe' } else { 'java' }
    & $javaExecutable -jar $jar
} finally { Pop-Location }
