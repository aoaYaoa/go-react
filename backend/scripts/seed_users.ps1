Write-Host "开始创建测试账号..." -ForegroundColor Green
Set-Location $PSScriptRoot\..
go run scripts/seed_users.go
Write-Host "完成！" -ForegroundColor Green
