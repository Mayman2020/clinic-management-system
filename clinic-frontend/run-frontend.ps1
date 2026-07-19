[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [int]$Port = 4200
)

$ErrorActionPreference = 'Stop'
$DefaultBackendApiUrl = "http://localhost:8086/api/v1"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$WorkspaceRoot = Split-Path -Parent $ScriptDir
$RuntimeStateFile = Join-Path $WorkspaceRoot ".runtime\launcher-state.json"
$RuntimeConfigJs = Join-Path $ScriptDir "src\assets\runtime-config.js"

function Write-Step { param([string]$Message, [string]$Color = "Cyan") Write-Host $Message -ForegroundColor $Color }

Set-Location $ScriptDir

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Step "Node.js is not installed or not in PATH." "Red"
    exit 1
}

$env:NG_CLI_ANALYTICS = "false"
$env:CI = "true"

if (-not $SkipInstall -and -not (Test-Path "node_modules")) {
    Write-Step "Installing dependencies..." "Cyan"
    & npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$backendApiUrl = $DefaultBackendApiUrl
$backendFileUrl = "$DefaultBackendApiUrl/files"
if (Test-Path $RuntimeStateFile) {
    try {
        $runtimeState = Get-Content -Path $RuntimeStateFile -Raw | ConvertFrom-Json
        if ($runtimeState.backendBaseUrl) { $backendApiUrl = [string]$runtimeState.backendBaseUrl }
        if ($runtimeState.backendFileBaseUrl) { $backendFileUrl = [string]$runtimeState.backendFileBaseUrl }
    } catch { Write-Step "Could not read runtime state; using defaults" "Yellow" }
}

@"
window.__CM_API_URL__ = '$backendApiUrl';
window.__CM_FILE_URL__ = '$backendFileUrl';
"@ | Set-Content -Path $RuntimeConfigJs -Encoding UTF8

Write-Step "Starting Clinic frontend on http://localhost:$Port" "Green"
Write-Step "Backend API: $backendApiUrl" "Gray"
Write-Step "Stop with Ctrl+C" "Gray"

& npx ng serve --project clinic-management-system --port=$Port --host 127.0.0.1
exit $LASTEXITCODE
