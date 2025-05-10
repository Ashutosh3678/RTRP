# PowerShell script to add login-profile.css to all HTML files
# Assuming the current directory is the project root

$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip if the file already has the login-profile.css link
    if ($content -match 'login-profile.css') {
        Write-Host "File $($file.Name) already has login-profile.css, skipping."
        continue
    }
    
    # Add login-profile.css after the templatemo-topic-listing.css
    $replacement = '<link href="../css/templatemo-topic-listing.css" rel="stylesheet">      

        <link href="../css/login-profile.css" rel="stylesheet">'
    
    $newContent = $content -replace '<link href="../css/templatemo-topic-listing.css" rel="stylesheet">      ', $replacement
    
    # If the original pattern wasn't found, try an alternative pattern
    if ($newContent -eq $content) {
        $pattern = '</head>'
        $replacement = '    <link href="../css/login-profile.css" rel="stylesheet">
</head>'
        $newContent = $content -replace $pattern, $replacement
    }
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $newContent
    
    Write-Host "Added login-profile.css to $($file.Name)"
}

Write-Host "All HTML files have been updated with login-profile.css!" 