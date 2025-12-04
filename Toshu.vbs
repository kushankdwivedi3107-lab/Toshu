Set oWS = WScript.CreateObject("WScript.Shell")
strPath = oWS.CurrentFolder
Set oLink = oWS.CreateShortcut(oWS.SpecialFolders("Desktop") & "\Toshu.lnk")
oLink.TargetPath = "python.exe"
oLink.Arguments = """" & strPath & "\toshu_app.py"""
oLink.WorkingDirectory = strPath
oLink.IconLocation = strPath & "\assets\icon.ico"
oLink.Description = "Toshu - Advanced Academic Writing Tool"
oLink.Save
