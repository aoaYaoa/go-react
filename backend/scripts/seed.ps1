# 数据填充脚本 (PowerShell)
# 从公开数据源获取并填充数据到数据库

$ErrorActionPreference = "Stop"

# 切换到backend目录
Set-Location $PSScriptRoot\..

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  执行数据填充" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查.env文件
if (-not (Test-Path .env)) {
    Write-Host "❌ 错误: 未找到.env文件" -ForegroundColor Red
    Write-Host "请复制.env.example并修改配置" -ForegroundColor Yellow
    exit 1
}

# 执行数据填充
Write-Host "🚀 运行数据填充脚本..." -ForegroundColor Yellow
Write-Host ""

go run scripts/seed_data.go

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 数据填充成功完成" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 数据填充失败，退出码: $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
