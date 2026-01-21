#!/bin/bash

# 启动脚本 - 同时启动前端和后端

echo "🚀 启动 Go-Gin + React 全栈项目"

# 检查是否安装了依赖
echo "📦 检查依赖..."

# 检查后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && go mod tidy && cd ..
fi

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install && cd ..
fi

# 启动后端
echo "🔧 启动后端服务..."
cd backend
go run main.go &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo "📡 后端地址: http://localhost:8080"
echo "🌐 前端地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号
trap "echo '🛑 停止所有服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 等待进程
wait
