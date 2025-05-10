$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if login-profile.js is already included
    if ($content -notmatch '<script src="../js/login-profile.js"></script>') {
        # Add login-profile.js before the closing body tag
        $content = $content -replace '</body>', '<script src="../js/login-profile.js"></script>
</body>'
        
        # Save the updated content
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "Added login-profile.js to $($file.Name)"
    } else {
        Write-Host "login-profile.js already exists in $($file.Name)"
    }
} 