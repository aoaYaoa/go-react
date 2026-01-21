#!/bin/bash

# 数据库初始化脚本
# 用于快速设置MySQL数据库

echo "=========================================="
echo "  Go Backend 数据库初始化脚本"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 读取配置
if [ ! -f .env ]; then
    echo -e "${RED}错误: 未找到.env文件${NC}"
    echo "请复制.env.example并修改配置"
    exit 1
fi

source .env

# 显示当前配置
echo -e "${YELLOW}当前配置:${NC}"
echo "数据库类型: $DATABASE_TYPE"
echo "数据库主机: $DATABASE_HOST"
echo "数据库端口: $DATABASE_PORT"
echo "数据库名称: $DATABASE_NAME"
echo "数据库用户: $DATABASE_USER"
echo ""

# 检查是否为MySQL
if [ "$DATABASE_TYPE" != "mysql" ]; then
    echo -e "${YELLOW}当前配置不使用MySQL，跳过数据库初始化${NC}"
    echo "如果需要初始化MySQL，请设置 DATABASE_TYPE=mysql"
    exit 0
fi

# 询问是否继续
read -p "是否继续初始化数据库? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "取消初始化"
    exit 0
fi

# 构建MySQL连接命令
MYSQL_CMD="mysql -h $DATABASE_HOST -P $DATABASE_PORT -u $DATABASE_USER"

# 检查MySQL连接
echo -e "${YELLOW}测试MySQL连接...${NC}"
if ! echo "SELECT 1;" | $MYSQL_CMD -p$DATABASE_PASS &>/dev/null; then
    echo -e "${RED}MySQL连接失败，请检查配置${NC}"
    exit 1
fi
echo -e "${GREEN}MySQL连接成功${NC}"

# 创建数据库（如果不存在）
echo -e "${YELLOW}检查并创建数据库...${NC}"
echo "CREATE DATABASE IF NOT EXISTS $DATABASE_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | $MYSQL_CMD -p$DATABASE_PASS
echo -e "${GREEN}数据库创建成功: $DATABASE_NAME${NC}"

# 授予权限
echo -e "${YELLOW}设置数据库权限...${NC}"
echo "GRANT ALL PRIVILEGES ON $DATABASE_NAME.* TO '$DATABASE_USER'@'%'; FLUSH PRIVILEGES;" | $MYSQL_CMD -p$DATABASE_PASS
echo -e "${GREEN}权限设置完成${NC}"

# 显示数据库信息
echo ""
echo -e "${GREEN}=========================================="
echo "  数据库初始化完成！"
echo "==========================================${NC}"
echo ""
echo "数据库信息:"
echo "  - 主机: $DATABASE_HOST"
echo "  - 端口: $DATABASE_PORT"
echo "  - 名称: $DATABASE_NAME"
echo "  - 用户: $DATABASE_USER"
echo ""
echo "下一步:"
echo "  1. 运行 'go run main.go' 启动应用"
echo "  2. 应用会自动创建所需表结构"
echo ""
