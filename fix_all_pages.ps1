# PowerShell script to add login-debug.js to all HTML files
# Assuming the current directory is the project root

$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip if the file already has the login-debug.js script
    if ($content -match 'login-debug.js') {
        Write-Host "File $($file.Name) already has login-debug.js, skipping."
        continue
    }
    
    # Add login-debug.js script right before </body>
    $content = $content -replace '</body>', '<script src="../js/login-debug.js"></script>
</body>'
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "Added login-debug.js to $($file.Name)"
}

Write-Host "All HTML files have been updated!" 