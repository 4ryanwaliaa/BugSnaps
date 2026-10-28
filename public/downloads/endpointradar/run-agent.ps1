[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$base = Join-Path $env:LOCALAPPDATA 'EndpointRadarAgent'
$config = Get-Content -LiteralPath (Join-Path $base 'config.json') -Raw | ConvertFrom-Json
if ($config.workspaceId -notmatch '^[A-Za-z0-9_-]{1,128}$' -or $config.deviceId -notmatch '^[A-Za-z0-9_-]{1,128}$') { throw 'Invalid agent configuration.' }
$url = "https://bugsnaps.in/endpointradar/api/device/$($config.workspaceId)/$($config.deviceId)"
Add-Type -AssemblyName System.Security
$encrypted = [IO.File]::ReadAllBytes((Join-Path $base 'secret.bin'))
$secretBytes = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
try {
    $secret = [Text.Encoding]::UTF8.GetString($secretBytes)
    $headers = @{ Authorization = "Bearer $secret" }
    $queuePath = Join-Path $base 'pending.json'
    $statePath = Join-Path $base 'state.json'
    $state = @{ lastSuccess = ''; lastRequest = '' }
    if (Test-Path -LiteralPath $statePath) {
        $loaded = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
        $state.lastSuccess = [string]$loaded.lastSuccess
        $state.lastRequest = [string]$loaded.lastRequest
    }
    # Reuse a queued scan ID after a failed or interrupted upload.
    if (-not (Test-Path -LiteralPath $queuePath)) {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -Method Get -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30
        if ($response.StatusCode -ne 200) { throw 'Could not retrieve schedule.' }
        $schedule = $response.Content | ConvertFrom-Json
        if (-not $schedule.enabled) { return }
        $interval = 0
        if (-not [int]::TryParse([string]$schedule.intervalMinutes, [ref]$interval) -or $interval -lt 15 -or $interval -gt 10080) { throw 'Server returned an invalid scan interval.' }
        $last = [DateTimeOffset]::MinValue
        $null = [DateTimeOffset]::TryParse($state.lastSuccess, [ref]$last)
        $requestTime = [DateTimeOffset]::MinValue
        $previousRequest = [DateTimeOffset]::MinValue
        $hasRequest = [DateTimeOffset]::TryParse([string]$schedule.scanRequestedAt, [ref]$requestTime)
        $null = [DateTimeOffset]::TryParse($state.lastRequest, [ref]$previousRequest)
        $requestDue = $hasRequest -and $requestTime -gt $previousRequest
        if (-not $requestDue -and ([DateTimeOffset]::UtcNow - $last).TotalMinutes -lt $interval) { return }
        $output = Join-Path $base ("scan-" + [guid]::NewGuid().ToString('N') + '.json')
        try {
            $process = Start-Process -FilePath $config.scannerPath -ArgumentList @('scan','--format','json','--no-save','--quiet','--output',("`"$output`"")) -PassThru -WindowStyle Hidden
            if (-not $process.WaitForExit(720000)) { $process.Kill(); throw 'The scan timed out.' }
            if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $output)) { throw 'The local scanner failed.' }
            $file = Get-Item -LiteralPath $output
            if ($file.Length -gt 4MB -or $file.Length -eq 0) { throw 'Invalid scanner output size.' }
            $scan = Get-Content -LiteralPath $output -Raw | ConvertFrom-Json
            if (-not $scan.hostname -or $null -eq $scan.vulnerabilities) { throw 'Invalid scanner output.' }
            # Upload the posture evidence used by the dashboard, not the complete
            # installed-software inventory, which can be very large and sensitive.
            $scan = [ordered]@{
                hostname = $scan.hostname; device_id = $scan.device_id; target_ip = $scan.target_ip
                risk_score = $scan.risk_score; risk_level = $scan.risk_level; connection_status = $scan.connection_status
                last_scan_at = $scan.last_scan_at; warnings = $scan.warnings; vulnerabilities = $scan.vulnerabilities
                antivirus = $scan.antivirus; firewall = $scan.firewall; patches = $scan.patches; device_protection = $scan.device_protection
                posture_checks = $scan.posture_checks
            }
            $pending = @{ scanId = [guid]::NewGuid().ToString(); scan = $scan; requestTime = if ($requestDue) { $requestTime.ToUniversalTime().ToString('o') } else { '' } }
            $candidate = @{ scanId = $pending.scanId; scan = $pending.scan } | ConvertTo-Json -Depth 40 -Compress
            if ([Text.Encoding]::UTF8.GetByteCount($candidate) -gt 120000) { throw 'Posture report exceeds the 120 KB upload limit; review and report the scanner output size.' }
            $temp = "$queuePath.tmp"
            $pending | ConvertTo-Json -Depth 40 -Compress | Set-Content -LiteralPath $temp -Encoding UTF8
            Move-Item -LiteralPath $temp -Destination $queuePath -Force
        } finally {
            Remove-Item -LiteralPath $output -Force -ErrorAction SilentlyContinue
        }
    }
    $pending = Get-Content -LiteralPath $queuePath -Raw | ConvertFrom-Json
    $body = @{ scanId = $pending.scanId; scan = $pending.scan } | ConvertTo-Json -Depth 40 -Compress
    if ([Text.Encoding]::UTF8.GetByteCount($body) -gt 120000) { throw 'Posture report exceeds the 120 KB upload limit; review and report the scanner output size.' }
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 60
    } catch {
        # A malformed, oversized, stale or invalid-timestamp report will never
        # become valid on retry. Keep it for diagnosis and allow a fresh scan.
        # Rate limits, service failures and network errors remain queued.
        if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -in @(400, 409, 413, 422)) {
            $status = [int]$_.Exception.Response.StatusCode
            Move-Item -LiteralPath $queuePath -Destination (Join-Path $base 'rejected-latest.json') -Force
            throw "The server rejected the report (HTTP $status). Check the device clock and scanner output; a fresh scan will run on the next check-in."
        }
        throw
    }
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) { throw 'Scan upload failed.' }
    $state.lastSuccess = [DateTimeOffset]::UtcNow.ToString('o')
    if ($pending.requestTime) { $state.lastRequest = [string]$pending.requestTime }
    $temp = "$statePath.tmp"
    $state | ConvertTo-Json -Compress | Set-Content -LiteralPath $temp -Encoding UTF8
    Move-Item -LiteralPath $temp -Destination $statePath -Force
    Remove-Item -LiteralPath $queuePath -Force
} catch {
    # Report a generic failure without uploading exception text, paths or credentials.
    # This event must never refresh the server's successful-scan timestamp.
    try { $null = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes('{"event":"scan_error"}')) -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 15 } catch { }
    throw
} finally {
    [Array]::Clear($secretBytes, 0, $secretBytes.Length)
    $secret = $null
    $headers = $null
}
