$files = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch '\\(\.git|node_modules|bin|obj|dist|logs)\\' -and 
    $_.Extension -notmatch '\.(png|jpg|jpeg|gif|svg|ico|exe|dll|pdb|zip|7z)$' 
}
foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $newContent = $content.Replace('ZenTask', 'ZenTask').Replace('ZenTask', 'ZenTask').Replace('zentask.io', 'zentask.io').Replace('ZenTask.API', 'ZenTask.API').Replace('ZenTask.Tests', 'ZenTask.Tests').Replace('ZenTaskAPI', 'ZenTaskAPI').Replace('ZenTaskFrontend', 'ZenTaskFrontend').Replace('ZenTask', 'ZenTask')
        
        if ($newContent -ne $content) {
            [System.IO.File]::WriteAllText($file.FullName, $newContent)
            Write-Host "Updated: $($file.FullName)"
        }
    } catch {
        Write-Warning "Failed to process: $($file.FullName)"
    }
}
