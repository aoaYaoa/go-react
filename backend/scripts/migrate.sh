#!/bin/bash

# 数据库迁移脚本
# 用于创建或更新数据库表结构

cd "$(dirname "$0")/.."

echo "=========================================="
echo "  执行数据库迁移"
echo "=========================================="
echo ""

# 检查.env文件
if [ ! -f .env ]; then
    echo "❌ 错误: 未找到.env文件"
    echo "请复制.env.example并修改配置"
    exit 1
fi

# 执行迁移
echo "🚀 运行迁移脚本..."
echo ""

go run scripts/migrate.go

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ 迁移成功完成"
else
    echo ""
    echo "❌ 迁移失败，退出码: $exit_code"
    exit $exit_code
fi
