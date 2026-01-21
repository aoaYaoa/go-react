@echo off
REM Windows 启动脚本

echo 🚀 启动 Go-Gin + React 全栈项目

REM 检查并安装后端依赖
echo 📦 检查后端依赖...
cd backend
go mod tidy
cd ..

REM 检查并安装前端依赖
echo 📦 检查前端依赖...
cd frontend
if not exist "node_modules" (
    call npm install
)
cd ..

REM 启动后端
echo 🔧 启动后端服务...
cd backend
start "Go Backend" go run main.go
cd ..

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo 🎨 启动前端服务...
cd frontend
start "React Frontend" npm run dev
cd ..

echo.
echo ✅ 服务启动完成！
echo 📡 后端地址: http://localhost:8080
echo 🌐 前端地址: http://localhost:5173
echo.
echo 按任意键关闭...
pause >nul
