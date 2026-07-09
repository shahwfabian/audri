# Audri — Windows Task Scheduler Setup
# Registers a daily task that scrapes scholarship data at 3 AM.
# Run once as Administrator: .\scripts\setup-scheduler.ps1

$TaskName    = "AudriScholarshipScraper"
$ProjectDir  = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$NodePath    = (Get-Command node -ErrorAction Stop).Source
$ScriptPath  = Join-Path $ProjectDir "scripts\scrape.ts"
$TsxPath     = Join-Path $ProjectDir "node_modules\.bin\tsx.cmd"

Write-Host "Setting up Audri scholarship scraper task..."
Write-Host "  Project: $ProjectDir"
Write-Host "  Script:  $ScriptPath"

# Remove existing task if present
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Build action: node tsx scripts/scrape.ts
$Action = New-ScheduledTaskAction `
    -Execute $NodePath `
    -Argument "`"$TsxPath`" `"$ScriptPath`"" `
    -WorkingDirectory $ProjectDir

# Trigger: daily at 3 AM
$Trigger = New-ScheduledTaskTrigger -Daily -At "03:00"

# Settings
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Daily scholarship data scrape for Audri — scholarships.com, fastweb.com, how2winscholarships.com" `
    -RunLevel Highest

Write-Host ""
Write-Host ("Task '" + $TaskName + "' registered. Runs daily at 3 AM.")
Write-Host ("To run now:  Start-ScheduledTask -TaskName '" + $TaskName + "'")
Write-Host ("To remove:   Unregister-ScheduledTask -TaskName '" + $TaskName + "'")
