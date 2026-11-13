# 机选 V2（导购版原型）

同仓并行的全新版本，入口 `v2/index.html`，构建后可通过 `/phone-selector/v2/` 访问（旧版仍在 `/`）。

## 设计目标

- **兼顾普通用户和参数党**：默认「导购模式」（暖白编辑风、结论优先），可一键切「专业模式」（深色高密度）。
- **决策优先**：3 步向导（预算 → 最看重的 2 项 → 必须项）→ 带匹配度、推荐理由、取舍的候选清单。
- **结论化详情**：一句话结论、适合/不适合、优缺点、关键参数、影像、同价位竞品。
- **对比给结论**：胜负高亮 + 电池/充电/重量条形 + 「更看重 X 选 A」的结论句。
- **不做**：榜单/评测内容、电商/商业化、价格历史（暂无稳定数据源）。

## 数据

- 复用仓库根 `data/phones.json`（官网人工整理，309 款），运行时通过 `BASE_URL + data/phones.json` 读取。
- 不改源数据；页面上的评分/结论/优缺点由 `src/lib/derive.js` 规则推导（0–100），仅供参考。

## 开发 / 预览

```bash
npm run dev          # 打开 http://localhost:5173/phone-selector/v2/
npm run build        # 同时构建旧版与 /v2/
npm run preview      # 打开 http://localhost:4173/phone-selector/v2/
```

## 目录

```
v2/
├── index.html
└── src/
    ├── main.js / App.vue
    ├── styles/            # tokens.css（双模式设计令牌）+ app.css
    ├── lib/
    │   ├── derive.js      # 评分/结论/向导/竞品/对比
    │   ├── store.js       # 全局状态（模式/收藏/对比）
    │   └── router.js      # hash 路由
    ├── components/        # Header / BottomNav / PhoneCard / Toast
    └── views/             # Home / Wizard / List / Detail / Compare
```

## 里程碑

- M1（已完成）：设计体系 + 数据派生层 + 首页 + 3 步向导 + 参数库 + 详情结论页 + 对比结论页 + 移动端底栏。
- M2（已完成）：
  - 收藏页（`#/favorites`）+ 顶部/底部导航入口
  - 参数库补齐筛选：屏幕尺寸、特性（潜望/无线充/IP68/≤200g/NFC/红外/USB3）、处理器家族（骁龙/天玑/麒麟/A 系）、充电协议（PD/PPS/UFCS/QC/SCP…）
  - 列表分页「加载更多」（每页 24 款）
  - 专业模式表格视图（10 列，横向滚动）
  - 详情页：五维评分条 + 同价位竞品「差异 chip」+「和它对比」
  - 对比分享图：Canvas 生成 1080×1350 竖版海报，可下载
  - 30 台热门机型「编辑点评」人工结论（`src/data/verdicts.json`，优先于规则文案）
- M3：价格参考/更新时间展示、PWA、对比图 iOS 保存兜底、列表虚拟滚动。
