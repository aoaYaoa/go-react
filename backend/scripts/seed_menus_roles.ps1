Write-Host "开始填充菜单和角色数据..." -ForegroundColor Green
Set-Location $PSScriptRoot\..
go run scripts/seed_menus_roles.go
Write-Host "完成！" -ForegroundColor Green
