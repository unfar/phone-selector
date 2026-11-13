#!/usr/bin/env bash
# deploy.sh — 本地一键发布：数据校验 → 构建 → 推送 main
# 推送后由 GitHub Actions 自动构建并发布到 GitHub Pages（见 .github/workflows/deploy.yml）
#
# 用法：./deploy.sh "feat(data): 新增 XXX（2026-XX-XX 发布）"

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

COMMIT_MSG="${1:-feat: update phone data and rebuild site $(date +'%Y-%m-%d')}"

echo -e "${YELLOW}📦 步骤 1/3: 数据校验...${NC}"
if ! python3 scripts/data_quality.py validate; then
    echo -e "${RED}❌ 数据校验未通过，终止发布${NC}"
    exit 1
fi
# data/ 是权威源，public/data/ 是运行时实际拉取的副本；两者不一致会让线上显示旧数据
if ! cmp -s data/phones.json public/data/phones.json; then
    echo -e "${RED}❌ data/phones.json 与 public/data/phones.json 不一致${NC}"
    echo -e "${YELLOW}   请先运行 npm run sync 同步数据，再重新发布${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 数据校验通过（data 与 public 已同步）${NC}"

echo -e "${YELLOW}📦 步骤 2/3: 前端构建...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ 前端构建失败，终止发布${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 构建成功${NC}"

echo -e "${YELLOW}📦 步骤 3/3: 提交并推送 main...${NC}"
git add -A
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  无改动可提交，跳过推送${NC}"
else
    git commit -m "$COMMIT_MSG"
    git push origin main
fi

echo -e "${GREEN}🎉 已推送，GitHub Actions 将自动部署（约 1 分钟）${NC}"
echo -e "${GREEN}   线上地址: https://unfar.github.io/phone-selector/${NC}"
