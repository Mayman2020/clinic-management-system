[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [int]$Port = 8086
)

$ErrorActionPreference = 'Stop'
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$MvnwPath = Join-Path $ScriptDir "mvnw.cmd"
$ContextPath = "/api/v1"
$WorkspaceRoot = Split-Path -Parent $ScriptDir
$RuntimeDir = Join-Path $WorkspaceRoot ".runtime"
$RuntimeStateFile = Join-Path $RuntimeDir "launcher-state.json"
$FrontendRuntimeConfigJs = Join-Path $WorkspaceRoot "clinic-frontend\src\assets\runtime-config.js"

function Write-Step { param([string]$Message, [string]$Color = "Cyan") Write-Host $Message -ForegroundColor $Color }

function Stop-ListenerOnPort {
    param([int]$TargetPort)
    $pattern = ':\s*' + $TargetPort + '\s+.*LISTENING\s+(\d+)\s*$'
    $pids = @()
    netstat -ano | ForEach-Object {
        if ($_ -match $pattern) {
            $pids += [int]$Matches[1]
        }
    }
    foreach ($procId in ($pids | Select-Object -Unique)) {
        if ($procId -le 0) { continue }
        Write-Step "Port $TargetPort in use by PID $procId - stopping previous instance..." "Yellow"
        taskkill /PID $procId /F | Out-Null
        Start-Sleep -Seconds 1
    }
}

$JavaCandidates = @($env:JAVA_HOME, "C:\Program Files\Java\jdk-17", "C:\Program Files\Eclipse Adoptium\jdk-17*")
$ResolvedJavaHome = $null
foreach ($candidate in $JavaCandidates) {
    if (-not $candidate) { continue }
    $path = if ($candidate -match '\*') { (Get-Item $candidate -ErrorAction SilentlyContinue | Select-Object -First 1).FullName } else { $candidate }
    if ($path -and (Test-Path (Join-Path $path "bin\java.exe"))) { $ResolvedJavaHome = $path; break }
}
if (-not $ResolvedJavaHome) { Write-Step "JAVA_HOME not found. Install JDK 17 or set JAVA_HOME." "Red"; exit 1 }
$env:JAVA_HOME = $ResolvedJavaHome
$env:Path = "$($env:JAVA_HOME)\bin;$env:Path"

Set-Location $ScriptDir
$env:SERVER_PORT = "$Port"
$env:FILE_BASE_URL = "http://localhost:$Port$ContextPath"
if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET = "DevOnly-Clinic-Local-JWT-Secret-Min32Chars!"
    Write-Step "JWT_SECRET not set - using local dev secret (not for production)" "Yellow"
}
if (-not $env:SPRING_PROFILES_ACTIVE) {
    $env:SPRING_PROFILES_ACTIVE = "dev"
}

Stop-ListenerOnPort -TargetPort $Port

if (-not $SkipBuild) {
    Write-Step "Maven compile..." "Cyan"
    & $MvnwPath compile -DskipTests
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$BaseUrl = "http://localhost:$Port$ContextPath"
if (-not (Test-Path $RuntimeDir)) { New-Item -ItemType Directory -Path $RuntimeDir | Out-Null }
@{
    backendPort = $Port
    backendBaseUrl = $BaseUrl
    backendFileBaseUrl = "$BaseUrl/files"
    updatedAt = (Get-Date).ToString("o")
} | ConvertTo-Json | Set-Content -Path $RuntimeStateFile -Encoding UTF8

if (Test-Path (Split-Path -Parent $FrontendRuntimeConfigJs)) {
@"
window.__CM_API_URL__ = '$BaseUrl';
window.__CM_FILE_URL__ = '$BaseUrl/files';
"@ | Set-Content -Path $FrontendRuntimeConfigJs -Encoding UTF8
    Write-Step "Frontend runtime config updated" "Gray"
}

Write-Step "Starting Clinic backend on $BaseUrl" "Green"
Write-Step "Default login: admin / Dev@Local2026!" "Gray"
Write-Step "Stop with Ctrl+C" "Gray"

& $MvnwPath spring-boot:run "-Dspring-boot.run.arguments=--server.port=$Port --file.base-url=http://localhost:$Port$ContextPath"
exit $LASTEXITCODE
