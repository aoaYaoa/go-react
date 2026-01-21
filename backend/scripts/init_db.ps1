# PowerShell数据库初始化脚本 (Windows)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Go Backend 数据库初始化脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查.env文件
if (-not (Test-Path ".env")) {
    Write-Host "错误: 未找到.env文件" -ForegroundColor Red
    Write-Host "请复制.env.example并修改配置"
    exit 1
}

# 读取.env配置
$envConfig = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $envConfig[$matches[1]] = $matches[2]
    }
}

# 显示配置
Write-Host "当前配置:" -ForegroundColor Yellow
Write-Host "  数据库类型: $($envConfig['DATABASE_TYPE'])"
Write-Host "  数据库主机: $($envConfig['DATABASE_HOST'])"
Write-Host "  数据库端口: $($envConfig['DATABASE_PORT'])"
Write-Host "  数据库名称: $($envConfig['DATABASE_NAME'])"
Write-Host "  数据库用户: $($envConfig['DATABASE_USER'])"
Write-Host ""

# 检查是否为MySQL
if ($envConfig['DATABASE_TYPE'] -ne "mysql") {
    Write-Host "当前配置不使用MySQL，跳过数据库初始化" -ForegroundColor Yellow
    exit 0
}

# 询问是否继续
$confirm = Read-Host "是否继续初始化数据库? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "取消初始化"
    exit 0
}

# 检查MySQL客户端
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Host "错误: 未找到MySQL客户端" -ForegroundColor Red
    Write-Host "请先安装MySQL客户端并将其添加到PATH"
    exit 1
}

# 构建连接参数
$host = $envConfig['DATABASE_HOST']
$port = $envConfig['DATABASE_PORT']
$user = $envConfig['DATABASE_USER']
$pass = $envConfig['DATABASE_PASS']
$dbName = $envConfig['DATABASE_NAME']

# 测试连接
Write-Host "测试MySQL连接..." -ForegroundColor Yellow
$testQuery = "SELECT 1;"
$testResult = mysql -h $host -P $port -u $user -p$pass -e $testQuery 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "MySQL连接失败，请检查配置" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}
Write-Host "MySQL连接成功" -ForegroundColor Green

# 创建数据库
Write-Host "检查并创建数据库..." -ForegroundColor Yellow
$createQuery = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -h $host -P $port -u $user -p$pass -e $createQuery
Write-Host "数据库创建成功: $dbName" -ForegroundColor Green

# 授予权限
Write-Host "设置数据库权限..." -ForegroundColor Yellow
$grantQuery = "GRANT ALL PRIVILEGES ON $dbName.* TO '$user'@'%'; FLUSH PRIVILEGES;"
mysql -h $host -P $port -u $user -p$pass -e $grantQuery
Write-Host "权限设置完成" -ForegroundColor Green

# 完成
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  数据库初始化完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "数据库信息:"
Write-Host "  - 主机: $host"
Write-Host "  - 端口: $port"
Write-Host "  - 名称: $dbName"
Write-Host "  - 用户: $user"
Write-Host ""
Write-Host "下一步:"
Write-Host "  1. 运行 'go run main.go' 启动应用"
Write-Host "  2. 应用会自动创建所需表结构"
Write-Host ""
