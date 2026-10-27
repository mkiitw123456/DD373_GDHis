$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDir
$mutex = New-Object Threading.Mutex($false, 'Local\DD373FirebaseSync')
if (-not $mutex.WaitOne(0)) { exit }
try {
  while ($true) {
    & node scripts/sync.mjs *>> sync.log
    Start-Sleep -Seconds 300
  }
} finally { $mutex.ReleaseMutex(); $mutex.Dispose() }
