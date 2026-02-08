#!/bin/bash

# 数据填充脚本
# 从公开数据源获取并填充数据到数据库

cd "$(dirname "$0")/.."

echo "=========================================="
echo "  执行数据填充"
echo "=========================================="
echo ""

# 检查.env文件
if [ ! -f .env ]; then
    echo "❌ 错误: 未找到.env文件"
    echo "请复制.env.example并修改配置"
    exit 1
fi

# 执行数据填充
echo "🚀 运行数据填充脚本..."
echo ""

go run scripts/seed_data.go

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ 数据填充成功完成"
else
    echo ""
    echo "❌ 数据填充失败，退出码: $exit_code"
    exit $exit_code
fi
