#!/bin/bash

# 智能手机选购助手 - GitHub上传脚本
# 使用方法：在终端中运行此脚本

echo "📱 智能手机选购助手 - GitHub上传脚本"
echo "====================================="
echo ""

# 检查是否已登录GitHub
if ! gh auth status &>/dev/null; then
    echo "❌ 请先登录GitHub："
    echo "   gh auth login --web"
    echo ""
    echo "或者使用Token登录："
    echo "   1. 访问 https://github.com/settings/tokens"
    echo "   2. 生成新Token（勾选repo权限）"
    echo "   3. 运行: echo '你的token' | gh auth login --with-token"
    exit 1
fi

echo "✅ GitHub已登录"
echo ""

# 获取用户名
USERNAME=$(gh api user -q .login 2>/dev/null)
if [ -z "$USERNAME" ]; then
    echo "❌ 无法获取GitHub用户名"
    exit 1
fi

echo "👤 GitHub用户: $USERNAME"
echo ""

# 创建仓库
echo "📦 创建GitHub仓库..."
REPO_NAME="phone-selector"

# 检查仓库是否已存在
if gh repo view "$USERNAME/$REPO_NAME" &>/dev/null; then
    echo "⚠️  仓库 $REPO_NAME 已存在"
else
    gh repo create "$REPO_NAME" --public --description "📱 智能手机选购助手 - 基于官方数据的多维度手机筛选工具" --homepage "https://$USERNAME.github.io/$REPO_NAME/"
    echo "✅ 仓库创建成功"
fi

echo ""

# 初始化Git仓库
cd ~/Desktop/phone-selector

if [ ! -d ".git" ]; then
    echo "🔧 初始化Git仓库..."
    git init
    git branch -M main
fi

# 配置Git用户信息
echo "📝 配置Git用户信息..."
git config user.name "$(gh api user -q .name 2>/dev/null || echo $USERNAME)"
git config user.email "$(gh api user -q .email 2>/dev/null || echo "$USERNAME@users.noreply.github.com")"

# 添加文件
echo "📁 添加文件..."
git add .
git commit -m "📱 初始版本：智能手机选购助手

- 230+款机型数据
- 12个品牌覆盖
- 多维度筛选功能
- 支持GitHub Pages部署"

# 推送代码
echo "🚀 推送到GitHub..."
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git" 2>/dev/null || true
git push -u origin main

echo ""

# 启用GitHub Pages
echo "🌐 启用GitHub Pages..."
gh api repos/$USERNAME/$REPO_NAME/pages \
  --method POST \
  --field source='{"branch":"main","path":"/"}' \
  --field build_type="legacy" 2>/dev/null || echo "⚠️  GitHub Pages可能需要手动启用"

echo ""
echo "====================================="
echo "✅ 完成！"
echo ""
echo "🌐 访问地址：https://$USERNAME.github.io/$REPO_NAME/"
echo ""
echo "💡 提示："
echo "   - GitHub Pages可能需要几分钟才能生效"
echo "   - 如果无法访问，请在仓库设置中手动启用GitHub Pages"
echo "   - 仓库地址：https://github.com/$USERNAME/$REPO_NAME"
echo ""