#!/bin/bash

echo "开始创建测试账号..."
cd "$(dirname "$0")/.."
go run scripts/seed_users.go
echo "完成！"
