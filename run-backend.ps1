$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location "$PSScriptRoot\clinic-backend"
# Optional: override DB connection
# $env:DB_URL = "jdbc:postgresql://localhost:5432/postgres?currentSchema=clinic_mgmt"
# $env:DB_USER = "postgres"
# $env:DB_PASS = "admin"
.\mvnw.cmd spring-boot:run
