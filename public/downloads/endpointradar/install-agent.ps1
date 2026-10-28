[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9_-]{1,128}$')][string]$WorkspaceId,
    [Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9_-]{1,128}$')][string]$DeviceId,
    [Parameter(Mandatory=$true)][string]$ScannerPath
)
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSEdition -ne 'Desktop' -or $PSVersionTable.PSVersion -lt [version]'5.1') { throw 'Open Windows PowerShell 5.1 to install the reporting helper.' }
if (([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run this installer in a normal, non-elevated PowerShell window.' }
if (-not (Test-Path -LiteralPath $ScannerPath -PathType Leaf) -or [IO.Path]::GetExtension($ScannerPath) -ne '.exe') { throw 'ScannerPath must identify the installed endpointradar.exe.' }
$scanner = (Resolve-Path -LiteralPath $ScannerPath).Path
$base = Join-Path $env:LOCALAPPDATA 'EndpointRadarAgent'
if (Test-Path -LiteralPath $base) { throw 'An agent directory already exists. Uninstall it before enrolling again.' }
if (Get-ScheduledTask -TaskName 'EndpointRadar Agent' -ErrorAction SilentlyContinue) { throw 'An EndpointRadar Agent task already exists.' }
$runner = Join-Path $PSScriptRoot 'run-agent.ps1'
if (-not (Test-Path -LiteralPath $runner -PathType Leaf)) { throw 'Keep run-agent.ps1 beside this installer.' }
$secret = Read-Host 'Paste the device enrollment secret (it will not be displayed)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
$bytes = $null
$created = $false
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    if ($plain.Length -lt 32 -or $plain.Length -gt 512 -or $plain -notmatch '^[A-Za-z0-9_-]+$') { throw 'Invalid device secret.' }
    # The job runs only as this user, at limited privilege. Never elevate a
    # user-writable scanner or its Python dependencies to SYSTEM.
    $acl = New-Object Security.AccessControl.DirectorySecurity
    $acl.SetAccessRuleProtection($true, $false)
    foreach ($sid in @([Security.Principal.WindowsIdentity]::GetCurrent().User.Value, 'S-1-5-18', 'S-1-5-32-544')) {
        $rule = New-Object Security.AccessControl.FileSystemAccessRule((New-Object Security.Principal.SecurityIdentifier($sid)), 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
        $acl.AddAccessRule($rule)
    }
    (New-Object IO.DirectoryInfo($base)).Create($acl)
    $created = $true
    Add-Type -AssemblyName System.Security
    $bytes = [Text.Encoding]::UTF8.GetBytes($plain)
    $encrypted = [Security.Cryptography.ProtectedData]::Protect($bytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    [IO.File]::WriteAllBytes((Join-Path $base 'secret.bin'), $encrypted)
    $headers = @{ Authorization = "Bearer $plain" }
    $url = "https://bugsnaps.in/endpointradar/api/device/$WorkspaceId/$DeviceId"
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -Method Get -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30
        if ($response.StatusCode -ne 200) { throw 'Device enrollment could not be verified.' }
    } catch {
        throw 'Device enrollment could not be verified. Check the device ID, secret and service availability.'
    } finally { $headers = $null }
    @{ workspaceId=$WorkspaceId; deviceId=$DeviceId; scannerPath=$scanner } | ConvertTo-Json -Compress | Set-Content -LiteralPath (Join-Path $base 'config.json') -Encoding UTF8
    Copy-Item -LiteralPath $runner -Destination (Join-Path $base 'run-agent.ps1')
    $script = Join-Path $base 'run-agent.ps1'
    $action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument "-NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`"" -WorkingDirectory $base
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration (New-TimeSpan -Days 3650)
    $settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 14) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName 'EndpointRadar Agent' -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
    Write-Host 'Agent installed for this user. It checks its schedule while this user is signed in.'
} catch {
    # The protected directory is newly created by this run only.
    if ($created -and (Test-Path -LiteralPath $base)) { Remove-Item -LiteralPath $base -Recurse -Force -ErrorAction SilentlyContinue }
    throw
} finally {
    if ($bytes) { [Array]::Clear($bytes, 0, $bytes.Length) }
    if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $plain = $null
}
