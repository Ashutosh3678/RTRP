# PowerShell script to add keyboard-shortcuts.js to all HTML files
# Assuming the current directory is the project root

$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip if the file already has the keyboard-shortcuts.js script
    if ($content -match 'keyboard-shortcuts.js') {
        Write-Host "File $($file.Name) already has keyboard-shortcuts.js, skipping."
        continue
    }
    
    # Add keyboard-shortcuts.js script right before </body>
    $content = $content -replace '</body>', '<script src="../js/keyboard-shortcuts.js"></script>
</body>'
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "Added keyboard-shortcuts.js to $($file.Name)"
}

Write-Host "All HTML files have been updated with keyboard shortcuts!" 