# 数据库迁移脚本 (PowerShell)
# 用于创建或更新数据库表结构

$ErrorActionPreference = "Stop"

# 切换到backend目录
Set-Location $PSScriptRoot\..

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  执行数据库迁移" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查.env文件
if (-not (Test-Path .env)) {
    Write-Host "❌ 错误: 未找到.env文件" -ForegroundColor Red
    Write-Host "请复制.env.example并修改配置" -ForegroundColor Yellow
    exit 1
}

# 执行迁移
Write-Host "🚀 运行迁移脚本..." -ForegroundColor Yellow
Write-Host ""

go run scripts/migrate.go

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 迁移成功完成" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 迁移失败，退出码: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
