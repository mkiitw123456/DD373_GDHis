$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $projectDir 'sync.config.json'))) { throw 'Configure sync.config.json before installing the task.' }
$loopScript = Join-Path $PSScriptRoot 'sync-loop.ps1'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $loopScript + '"') -WorkingDirectory $projectDir
$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$logon = New-ScheduledTaskTrigger -AtLogOn -User $userId
$repeat = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'DD373 Firebase Sync' -Action $action -Trigger @($logon,$repeat) -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName 'DD373 Firebase Sync'
Write-Output 'DD373 Firebase Sync installed and started.'
