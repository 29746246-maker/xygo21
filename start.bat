@echo off

echo 正在启动 AI 团队协作应用...
echo ================================

REM 检查是否安装了 Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 找到 Python，使用 SPA 服务器启动（支持所有路由导航）...
    cd /d "%~dp0"
    python server.py
    pause
) else (
    echo 需要 Python 来运行 SPA 服务器，请安装 Python 后重试
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

pause