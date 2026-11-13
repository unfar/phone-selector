# 📱 机选 · 智能手机选购助手

基于 Vue 3 + Vite 构建的国行智能手机参数筛选与对比工具。

## 在线访问

- 旧版（参数库）：**https://unfar.github.io/phone-selector/**
- V2 导购版（预览）：**https://unfar.github.io/phone-selector/v2/**

> V2 与旧版同仓并行：源码在 `v2/`，复用同一份 `data/phones.json`，详见 [v2/README.md](v2/README.md)。

## 架构

- **Vue 3.5（Composition API）** + **Vite 6** 构建，`base=/phone-selector/`
- **SPA + hash 路由**：`#view=detail&id=…`、`#view=compare&cmp=…`，筛选/排序/搜索状态全部写入 URL，可分享、可前进后退
- **数据运行时加载**：`App.vue` 中 `fetch(import.meta.env.BASE_URL + 'data/phones.json')`，首次进入先取 ~660 KB JSON（gzip 后约 70 KB），带加载态与失败重试兜底
- **组件拆分**：`App.vue` 只做外壳（列表/详情/对比路由与全局交互），业务拆到 `components/` + `composables/`
- **主题**：CSS 变量驱动（`style.css` 顶部 `:root` + `[data-theme="dark"]`），支持浅色米色 editorial / 深夜暗黑，跟随系统或手动切换
- **共享状态**：`src/composables/useApp.js` 提供 phones/filtered/compare 等 reactive 状态与 `cardBrief()`；`useFilterUI.js` 管筛选面板与移动端抽屉，`useCompare.js` 管对比，`useShare.js` 管分享

## 核心目录

```
phone-select/
├── index.html                # Vite 模板入口（SEO meta / JSON-LD / manifest）
├── vite.config.js            # 构建配置（base=/phone-selector/）
├── style.css                 # 全部样式（含深/浅色主题）
├── src/
│   ├── main.js               # Vue 入口
│   ├── App.vue               # 外壳：列表 / 详情 / 对比 视图切换 + FAB 抽屉
│   ├── utils.js              # 展示与归一化工具（价格/容量/相机/屏幕形态…）
│   ├── cpuTags.config.js     # CPU 标签顺序与厂商分组配置
│   ├── components/           # PhoneCard / PhoneTable / PhoneDetail / CompareView /
│   │                         # FilterDrawer / FilterBody / ListToolbar / PriceSlider
│   └── composables/          # useApp / useFilterUI / useCompare / useShare
├── data/
│   └── phones.json           # 唯一权威数据源（只改这里）
├── public/
│   └── data/phones.json      # 运行时实际拉取的副本（由 npm run sync 同步）
├── dist/                     # 本地构建产物（gitignore；CI 每次重新构建）
└── scripts/
    ├── data_quality.py       # 数据校验 / 标准化 / 双文件同步
    └── …                     # 相机字段、充电协议等一次性抓取/补全脚本
```

## 数据

- `data/phones.json` 是**唯一权威数据源**，300+ 台国行机型
- 字段命名一律 `snake_case`（`battery_mah` / `weight_g` / `charging_w` / `network_model` / `detailed_camera`）
- 传感器型号强制带品牌（`索尼IMX921` / `三星HP5` / `豪威OV52A` / `思特威SC585XS`）
- 双轨字段需同步（`features[]` ↔ `ip_rating`；`tags[]` ↔ `has_ir` 等）
- **未发布机型**用 `status: "unreleased"` 标记（前端据此显示「未发布」角标、价格显示「待公布」，`price_note` 写延后说明）

### 数据操作流程

```bash
npm run data:validate   # 校验（0 error 才允许发布；有 error 退出码 1）
npm run sync            # 标准化 + 把 data/phones.json 同步到 public/data（并刷新 dist/data）
npm run data:all        # 先校验再标准化
```

改完数据后务必跑一次 `npm run sync`，否则运行时拉取的 `public/data/phones.json` 仍是旧数据；
校验器会自动重建 `tags[]`（如「潜望长焦」按 `detailed_camera` 是否含「潜望」生成），不要手写与描述矛盾的标签。

## 品牌覆盖

苹果、华为、荣耀、小米、红米、OPPO、一加、真我、vivo、iQOO、三星、努比亚（红魔）、摩托罗拉、联想（拯救者）

## 部署

**正式部署走 GitHub Actions（发布到 gh-pages 分支）**：

1. push 到 `main`（`./deploy.sh "..."` 或直接 `git push`）
2. `.github/workflows/deploy.yml` 自动执行：`npm ci` → 数据校验 → `npm run build`
3. 把 `dist/` 强制推送到 `gh-pages` 分支（Pages 的 Source 是 **gh-pages 分支**，路径 `/`）

> ⚠️ Pages 的 Source 必须是「Deploy from a branch → gh-pages / (root)」。
> 不要改回「GitHub Actions」，否则 `deploy-pages` 与 branch build 会互相覆盖，导致线上空白页。

本地一键发布（校验 + 构建 + 推送 main，推送后由 CI 部署）：

```bash
./deploy.sh "feat(data): 新增 XXX（2026-XX-XX 发布）"
```

## 开发

```bash
npm install
npm run dev       # 本地起 5173
npm run build     # 产物到 dist/
npm run preview   # 本地预览构建产物
```

## 数据来源

Apple / 华为 / 荣耀 / 小米 / OPPO / 一加 / 真我 / vivo / iQOO / 三星 / 红魔 / 联想 / 努比亚 / 摩托罗拉 等**品牌官网**为主要参考；辅助 GSMArena / 九锋网 / 太平洋电脑 / 什么值得买 / IT之家 / 思特威公告 / 数码闲聊站爆料。

数据由人工与 AI 混合维护。官方不公布的字段（如 CMOS 型号）依赖九锋网拆解与产业链爆料，**只在多源一致的情况下写入**。

## License

数据非盈利使用；代码部分 MIT。若要 fork 项目，请保留 attribution。
