# 📱 机选 · 智能手机选购助手

基于 Vue 3 + Vite 构建的国行智能手机参数筛选与对比工具。

## 在线访问

**https://unfar.github.io/phone-selector/**

## 架构

- **Vue 3.4+ Composition API** + **Vite 5** 构建
- **单文件入口** `src/main.js` → `src/App.vue`，所有列表/详情/对比/搜索 UI 内联在 `App.vue`
- **数据构建时内联**：`import phonesData from '../data/phones.json'` 在 bundle 中静态注入（**不走运行时 fetch**），首屏加载只下载一个 JS
- **主题**：CSS 变量驱动（`style.css` 顶部 `:root` + `[data-theme="dark"]`），支持浅色米色 editorial / 深夜暗黑
- **共享状态**：`src/composables/useApp.js` 提供 phones/ref/filtered/compare 等 reactive 状态与 `cardBrief()` 帮助函数

## 核心目录

```
phone-select/
├── index.html              # Vite 模板入口
├── vite.config.js          # 构建配置（base=/phone-selector/）
├── src/
│   ├── main.js             # Vue 入口
│   ├── App.vue             # 主组件（列表 + 详情 + 对比 + FAB 抽屉）
│   ├── style.css           # 全部样式（CSS 变量主题 + 浅色/暗色）
│   ├── components/         # 极少子组件（当前仅 PriceSlider）
│   └── composables/
│       └── useApp.js       # 全局共享状态
├── data/
│   └── phones.json         # 唯一权威数据源
├── public/
│   └── data/phones.json    # build 同步副本
├── dist/                   # 构建产物（部署源）
└── scripts/data_quality.py # 数据校验器
```

## 数据

- `data/phones.json` 单一权威，~270-280 台国行在售机型
- 字段命名一律 `snake_case`（`battery_mah` / `weight_g` / `charging_w` / `network_model` / `detailed_camera`）
- 传感器型号强制带品牌（`索尼IMX921` / `三星HP5` / `豪威OV52A` / `思特威SC585XS`）
- 双轨字段需同步（`features[]` ↔ `ip_rating`；`tags[]` ↔ `has_ir` 等）
- 每次写入先跑 `python3 scripts/data_quality.py validate` 0 错误再构建

## 品牌覆盖

苹果、华为、荣耀、小米、OPPO、一加、真我、vivo、iQOO、三星、努比亚（红魔）、摩托罗拉、ASUS、Sonim、Unihertz、魅族、AGM、联想、Google Pixel（不出中国大陆）

## 部署

```bash
npm ci
npm run build
gh-pages -d dist -b gh-pages    # 由 npm scripts deploy 调用
```

或走 GitHub Actions：push 到 `main` 自动 build + 部署到 `gh-pages`/`/phone-selector/`。

## 开发

```bash
npm install
npm run dev       # 本地起 5173
npm run build     # 产物到 dist/
npm run preview   # 本地预览产物
```

## 数据来源

Apple / 华为 / 荣耀 / 小米 / OPPO / 一加 / 真我 / vivo / iQOO / 三星 / 红魔 / 联想 / 努比亚 / 摩托罗拉 等**品牌官网**为主要参考；辅助 GSMArena / 九锋网 / 太平洋电脑 / 什么值得买 / IT之家 / 思特威公告 / 数码闲聊站爆料。

数据由人工与 AI 混合维护。官方不公布的字段（如 CMOS 型号）依赖九锋网拆解与产业链爆料，**只在多源一致的情况下写入**。

## License

数据非盈利使用；代码部分 MIT。若要 fork 项目，请保留 attribution。
