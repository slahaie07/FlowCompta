$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut("C:\Users\user\Desktop\ComptaFlow.lnk")
$Shortcut.TargetPath = "C:\Users\user\Desktop\Comptaflow.html"
$Shortcut.IconLocation = "C:\Users\user\CODE_WORKSPACE\Projects\flowcompta\comptaflow_final.ico"
$Shortcut.Save()
Write-Output "Shortcut created successfully with Comptaflow icon."
