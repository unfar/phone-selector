#!/usr/bin/env bash
# deploy.sh — 一键构建 + 校验 + 发布脚本

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

COMMIT_MSG="${1:-feat: update phone data and rebuild site $(date +'%Y-%m-%d')}"

echo -e "${YELLOW}📦 步骤 1: 数据校验...${NC}"
if ! python3 data_validator.py; then
    echo -e "${RED}❌ 数据校验失败，终止部署${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 数据校验通过${NC}"

echo -e "${YELLOW}📦 步骤 2: 参数格式校验...${NC}"
if ! python3 parameter_validator.py; then
    echo -e "${RED}❌ 参数格式校验失败，终止部署${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 参数格式校验通过${NC}"

echo -e "${YELLOW}📦 步骤 3: 前端构建...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ 前端构建失败，终止部署${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 前端构建成功${NC}"

echo -e "${YELLOW}📦 步骤 4: Git 推送...${NC}"
git add -A
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️  无新更改${NC}"
git push

echo -e "${GREEN}🎉 部署完成！请检查 https://unfar.github.io/phone-selector/${NC}"
