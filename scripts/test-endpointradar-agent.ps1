$ErrorActionPreference = 'Stop'
$originalLocalAppData = $env:LOCALAPPDATA
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('edr-agent-test-' + [guid]::NewGuid().ToString('N'))
$env:LOCALAPPDATA = $testRoot
$base = Join-Path $testRoot 'EndpointRadarAgent'
$null = New-Item -ItemType Directory -Path $base -Force
$runner = Join-Path $PSScriptRoot '../public/downloads/endpointradar/run-agent.ps1'
Add-Type -AssemblyName System.Security
$rawSecret = [Text.Encoding]::UTF8.GetBytes(('a' * 43))
[IO.File]::WriteAllBytes((Join-Path $base 'secret.bin'), [Security.Cryptography.ProtectedData]::Protect($rawSecret, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser))
@{ workspaceId='workspace'; deviceId='device'; scannerPath='scanner.exe' } | ConvertTo-Json | Set-Content (Join-Path $base 'config.json')
$global:fakeSchedule = @{ enabled=$true; intervalMinutes=60; scanRequestedAt=$null }
$global:postIds = @()
$global:scanCalls = 0
$global:failPost = $true
$global:obsoletePost = $false
$global:obsoleteStatus = 409
$global:failureEvents = 0
function Invoke-WebRequest {
    param($Uri,$Headers,$Method,[switch]$UseBasicParsing,$MaximumRedirection,$TimeoutSec,$ContentType,$Body)
    if ($Uri -ne 'https://bugsnaps.in/endpointradar/api/device/workspace/device') { throw 'Incorrect host or endpoint' }
    if ($Method -eq 'Get') { return @{ StatusCode=200; Content=($global:fakeSchedule | ConvertTo-Json) } }
    $payload = [Text.Encoding]::UTF8.GetString($Body) | ConvertFrom-Json
    if ($payload.event -eq 'scan_error') { $global:failureEvents++; return @{ StatusCode=200 } }
    $global:postIds += $payload.scanId
    if ($global:obsoletePost) {
        $obsoleteError = New-Object System.Exception('obsolete capture')
        $obsoleteError | Add-Member -NotePropertyName Response -NotePropertyValue @{ StatusCode=$global:obsoleteStatus }
        throw $obsoleteError
    }
    if ($global:failPost) { throw 'simulated lost response' }
    return @{ StatusCode=200 }
}
function Start-Process {
    param($FilePath,$ArgumentList,[switch]$PassThru,$WindowStyle)
    if ($WindowStyle -ne 'Hidden') { throw 'Background scanner must not open a visible window' }
    $global:scanCalls++
    $output = $ArgumentList[-1].Trim('"')
    @{ hostname='test-machine'; vulnerabilities=@(); last_scan_at='2026-10-28T00:00:00Z' } | ConvertTo-Json | Set-Content -LiteralPath $output
    $process = New-Object PSObject -Property @{ ExitCode=0 }
    $process | Add-Member ScriptMethod WaitForExit { param($timeout) return $true }
    return $process
}
try {
    try { & $runner; throw 'Expected a simulated failure' } catch { if ($_.Exception.Message -ne 'simulated lost response') { throw } }
    if (-not (Test-Path (Join-Path $base 'pending.json'))) { throw 'Failed upload did not preserve pending scan' }
    $global:failPost = $false
    & $runner
    if ($global:postIds.Count -ne 2 -or $global:postIds[0] -ne $global:postIds[1]) { throw 'Retry did not reuse the same scan ID' }
    if ($global:scanCalls -ne 1 -or (Test-Path (Join-Path $base 'pending.json'))) { throw 'Retry state was not cleared' }
    & $runner
    if ($global:scanCalls -ne 1) { throw 'Interval was not respected' }
    $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.ToString('o')
    & $runner
    if ($global:scanCalls -ne 2) { throw 'Retest request was not honored' }
    & $runner
    if ($global:scanCalls -ne 2) { throw 'Retest request was repeated' }
    $global:fakeSchedule.enabled = $false
    $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.AddMinutes(1).ToString('o')
    & $runner
    if ($global:scanCalls -ne 2) { throw 'Disabled device started a scan' }
    $global:fakeSchedule.enabled = $true
    $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.AddMinutes(2).ToString('o')
    $global:obsoletePost = $true
    try { & $runner; throw 'Expected obsolete capture rejection' } catch { if ($_.Exception.Message -notlike '*HTTP 409*') { throw } }
    if (Test-Path (Join-Path $base 'pending.json')) { throw 'Obsolete capture blocks future scans' }
    if (-not (Test-Path (Join-Path $base 'rejected-latest.json'))) { throw 'Rejected evidence was not preserved' }
    $global:obsoletePost = $false
    & $runner
    if ($global:scanCalls -ne 4) { throw 'A fresh scan did not run after obsolete rejection' }
    $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.AddMinutes(3).ToString('o')
    $global:obsoleteStatus = 422
    $global:obsoletePost = $true
    try { & $runner; throw 'Expected invalid timestamp rejection' } catch { if ($_.Exception.Message -notlike '*HTTP 422*') { throw } }
    if (Test-Path (Join-Path $base 'pending.json')) { throw 'Invalid timestamp blocks recovery after correcting the clock' }
    $global:obsoletePost = $false
    & $runner
    if ($global:scanCalls -ne 6 -or $global:failureEvents -ne 3) { throw 'Clock recovery or generic failure reporting did not work' }
    foreach ($status in @(400, 413)) {
        $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.AddMinutes(4 + $status).ToString('o')
        $global:obsoleteStatus = $status
        $global:obsoletePost = $true
        try { & $runner; throw 'Expected permanent validation rejection' } catch { if ($_.Exception.Message -notlike "*HTTP $status*") { throw } }
        if (Test-Path (Join-Path $base 'pending.json')) { throw "HTTP $status blocks a fresh scan" }
        if (-not (Test-Path (Join-Path $base 'rejected-latest.json'))) { throw "HTTP $status did not preserve the rejected report" }
        $previousCount = $global:scanCalls
        $global:obsoletePost = $false
        & $runner
        if ($global:scanCalls -ne $previousCount + 1) { throw "HTTP $status did not recover with a fresh scan" }
    }
    $global:fakeSchedule.scanRequestedAt = [DateTimeOffset]::UtcNow.AddDays(1).ToString('o')
    $global:obsoleteStatus = 429
    $global:obsoletePost = $true
    try { & $runner; throw 'Expected rate-limit rejection' } catch { if ($_.Exception.Message -ne 'obsolete capture') { throw } }
    if (-not (Test-Path (Join-Path $base 'pending.json'))) { throw 'A temporary rate limit discarded the queued scan' }
    $global:obsoletePost = $false
    $savedId = (Get-Content (Join-Path $base 'pending.json') -Raw | ConvertFrom-Json).scanId
    & $runner
    if ($global:postIds[-1] -ne $savedId) { throw 'A temporary rate limit did not retry the same scan' }
    Write-Output 'PASS: retry, schedule, retest, disabled state, permanent validation recovery, temporary rate limits, and failure reporting.'
} finally {
    $env:LOCALAPPDATA = $originalLocalAppData
    if (([IO.Path]::GetFullPath($testRoot)).StartsWith([IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase)) { Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue }
}
