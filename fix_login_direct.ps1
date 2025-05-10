# PowerShell script to add direct onclick navigation to all login icons
# Assuming the current directory is the project root

$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Add direct window.location navigation to any student login links that don't already have it
    $pattern = '<a href="student-login.html" class="navbar-icon bi-person"'
    $replacement = '<a href="student-login.html" class="navbar-icon bi-person" onclick="window.location.href=''student-login.html''; return false;"'
    
    # Replace the pattern
    $newContent = $content -replace $pattern, $replacement
    
    # Only write if changes were made
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Added direct navigation to login icons in $($file.Name)"
    } else {
        Write-Host "No changes needed for $($file.Name)"
    }
}

Write-Host "All login icons have been updated with direct navigation!" 