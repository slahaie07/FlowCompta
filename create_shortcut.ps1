# Raccourci Bureau → ouvre https://compta-flow.net dans le navigateur (pas de fichier .html local).
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $root "Ouvrir-ComptaFlow.ps1"
$icon = Join-Path $root "comptaflow_final.ico"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut("$env:USERPROFILE\Desktop\ComptaFlow.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
$Shortcut.WorkingDirectory = $root
if (Test-Path $icon) {
  $Shortcut.IconLocation = $icon
}
$Shortcut.Save()
Write-Output "Raccourci créé : ouvre https://compta-flow.net dans le navigateur."
