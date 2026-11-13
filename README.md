# 📱 机选 · 3 步找到适合你的手机

面向换机用户的国行手机选购工具：**3 步向导给出带理由的候选**，同时保留完整参数库给参数党。
Vue 3 + Vite 构建，数据为官网人工整理（309 款），部署在 GitHub Pages。

**在线访问：https://unfar.github.io/phone-selector/**

## 核心能力

- **3 步决策向导**：预算 → 最看重的 2 项（拍照/游戏/续航/屏幕/轻薄）→ 必须条件（防水/无线充/折叠/直屏/潜望…）→ 6 台候选，带匹配度、推荐理由与取舍
- **双模式**：默认「导购」（暖白、结论优先）；一键切「专业」（深色、表格视图、全量规格）
- **结论化详情**：一句话结论、适合/不适合、优点/取舍、五维评分条、影像系统、同价位竞品差异、数据来源与更新时间
- **对比给结论**：2–4 台胜负高亮 + 电池/重量/充电条形 + 「更看重 X 选 A」，支持生成 1080×1350 对比分享图
- **参数库**：8 组筛选（场景/价格/形态/尺寸/特性/处理器家族/充电协议/品牌）+ 7 种排序 + 分页
- **编辑点评**：66 台热门机型人工结论（`src/data/verdicts.json`），优先于规则文案
- 收藏、对比车、URL 状态可分享、移动端底部导航；兼容旧版分享链接（`#view=detail&id=…` 自动跳转）

## 架构

- **Vue 3.5 + Vite 6**，hash 路由（`#/`、`#/wizard`、`#/list`、`#/phone/:id`、`#/compare`、`#/favorites`）
- 数据运行时加载：`fetch(BASE_URL + 'data/phones.json')`
- 评分/结论/向导打分由 `src/lib/derive.js` 规则推导（0–100，仅供参考），不修改源数据
- 设计令牌在 `src/styles/tokens.css`（浅色导购 / 深色专业两套），布局样式在 `src/styles/app.css`

## 目录

```
phone-select/
├── index.html                 # 入口（SEO / 主题预置）
├── vite.config.js             # base=/phone-selector/
├── src/
│   ├── main.js / App.vue
│   ├── lib/                   # derive.js（评分/结论/向导）、store.js、router.js、shareImage.js
│   ├── data/verdicts.json     # 66 台编辑点评
│   ├── components/            # Header / BottomNav / PhoneCard / Toast
│   ├── views/                 # Home / Wizard / List / Detail / Compare / Favorites
│   └── styles/                # tokens.css + app.css
├── data/phones.json           # 唯一权威数据源（309 款）
├── public/data/phones.json    # 运行时实际拉取的副本（npm run sync 同步）
├── public/                    # favicon / logo / manifest / og-image / robots / sitemap
├── scripts/data_quality.py    # 数据校验 / 标准化 / 同步
└── deploy.sh                  # 本地一键发布
```

## 数据

- `data/phones.json` 唯一权威，300+ 台国行机型；字段 snake_case
- 修改数据后必须 `npm run sync` 同步到 `public/data/phones.json`（CI 会校验两者一致）
- 未发布机型用 `status: "unreleased"` 标记；`price_note` 说明待公布原因
- 校验：`npm run data:validate`（0 error 才允许发布）

```bash
npm run sync          # 标准化 + 同步 public/data
npm run data:validate # 数据门禁
```

## 开发 / 构建

```bash
npm install
npm run dev       # http://localhost:5173/phone-selector/
npm run build     # 产物 dist/
npm run preview   # 预览构建产物
```

## 部署

push 到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）执行：
`npm ci` → 数据校验 → `npm run build` → 把 `dist/` 强制推送到 **gh-pages 分支**。
GitHub Pages 的 Source 必须保持「Deploy from a branch → gh-pages / (root)」。

本地一键发布（校验 + 构建 + 推送 main）：

```bash
./deploy.sh "feat: ..."
```

旧路径 `/phone-selector/v2/` 会 302 到根路径（保留历史链接）。

## 历史

- V1（参数库 + 筛选器）已于 2026-11 由 V2 取代，源码保留在 git 历史中（`ac6908f` 及更早）。
- V1 分享链接 `#view=detail&id=…`、`#view=compare&cmp=…` 会在 V2 中自动跳转到对应页面。

## 数据来源

Apple / 华为 / 荣耀 / 小米 / 红米 / OPPO / 一加 / 真我 / vivo / iQOO / 三星 / 努比亚 / 摩托罗拉 / 联想 等**品牌官网**为主，人工整理；官方不公布的字段（如 CMOS 型号）依赖拆解与产业链爆料，多源一致才写入。

## License

数据非盈利使用；代码部分 MIT。fork 请保留 attribution。
