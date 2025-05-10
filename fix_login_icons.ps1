# PowerShell script to fix login icon links by removing smoothscroll class
# Assuming the current directory is the project root

$htmlFiles = Get-ChildItem -Path "html/*.html" -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace login icon links with smoothscroll class with fixed version
    $content = $content -replace '<a href="student-login.html" class="navbar-icon bi-person smoothscroll">', '<a href="student-login.html" class="navbar-icon bi-person">'
    
    # Replace top links that should be kept as smoothscroll
    $content = $content -replace '<a href="#top" class="navbar-icon bi-person smoothscroll">', '<a href="#top" class="navbar-icon bi-person smoothscroll">'
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "Fixed $($file.Name)"
}

Write-Host "All login icon links have been fixed!" 