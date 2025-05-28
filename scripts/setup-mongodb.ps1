# Create data directory
$dataPath = "C:\data\db"
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force
    Write-Host "Created MongoDB data directory at $dataPath"
}

# Verify MongoDB installation
try {
    $mongoVersion = mongod --version
    Write-Host "MongoDB is installed successfully!"
    Write-Host $mongoVersion
} catch {
    Write-Host "MongoDB is not installed or not in PATH. Please complete the installation first."
    exit 1
}

# Test MongoDB connection
try {
    $mongoStatus = Get-Service MongoDB
    if ($mongoStatus.Status -eq "Running") {
        Write-Host "MongoDB service is running"
    } else {
        Write-Host "Starting MongoDB service..."
        Start-Service MongoDB
        Write-Host "MongoDB service started"
    }
} catch {
    Write-Host "MongoDB service not found. Please complete the installation first."
    exit 1
}

Write-Host "`nMongoDB is ready to use!"
Write-Host "Connection string for your application: mongodb://localhost:27017/micro-projects"
