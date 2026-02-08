#!/bin/bash

echo "开始填充菜单和角色数据..."
cd "$(dirname "$0")/.."
go run scripts/seed_menus_roles.go
echo "完成！"
