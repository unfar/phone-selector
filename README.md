# 机选 · 智能手机选购助手

基于官方数据的多维度手机筛选工具，帮助你找到最适合的手机。

**品牌名：机选**（PickPhone）  
**定位：国行参数筛选 · 影像对比 · 选购决策**

## 在线访问

**GitHub Pages：** [https://unfar.github.io/phone-selector/](https://unfar.github.io/phone-selector/)

## 功能特点

- **260 款机型**：覆盖苹果、华为、小米、OPPO、vivo、三星、荣耀、一加、真我、iQOO、红魔、REDMI、摩托罗拉、联想等品牌
- **100% 价格覆盖**：所有机型均收录官方起售价
- **多维度筛选**：品牌、价格区间、屏幕形态、处理器（按数据动态生成）、特性标签、充电协议、屏幕尺寸（均可多选叠加）
- **丰富标签**：潜望长焦、大电池 6500mAh+、轻薄 ≤200g、防水、NFC、红外、USB3.0、无线充电、散热风扇等
- **9 种排序**：最新发布、价格、电池容量、重量、屏幕大小、快充功率、品牌 A-Z
- **详细参数**：处理器、屏幕、电池、充电、USB 版本、重量、系统、摄像头等
- **智能搜索**：支持「小米17」「一加15」等中文品牌+数字连写、中英文品牌别名、多关键词
- **规格对比**：最多 4 款机型对比，差异项高亮，摄像头逐镜头分行
- **同价位竞品**：详情页自动推荐 ±15% 价位的跨品牌竞品
- **URL 状态同步**：筛选/排序/对比状态写入 URL hash，可分享链接、刷新不丢

## 项目结构

```
phone-selector/
├── index.html              # 主入口（GitHub Pages 读取此文件）
├── data/
│   └── phones.json         # 手机数据（JSON 格式，便于维护）
├── src/
│   ├── main.js             # Vue 入口
│   ├── App.vue             # 主视图（列表/详情/对比）
│   ├── utils.js            # 配置数据与工具函数（标签、品牌色、影像解析等）
│   ├── composables/
│   │   └── useApp.js       # 状态与筛选/排序/搜索逻辑
│   └── components/
│       └── PriceSlider.vue # 价格区间滑块
├── scripts/
│   ├── data_quality.py     # 数据质量校验与归一化（npm run data:*）
│   └── fetch_charge_protocols.py
├── data_validator.py       # 数据校验工具
├── parameter_validator.py  # 参数校验工具
├── auto_fixer.py           # 自动纠错工具
├── cli.py                  # 命令行查询工具
├── vite.config.js          # 构建配置（自动同步数据到产物）
└── .github/workflows/deploy.yml  # 推送自动构建并部署到 GitHub Pages
```

数据存储在 `data/phones.json` 中，构建时由 vite 插件自动同步到 `public/data/` 与 `dist/data/`，保证部署产物始终使用最新数据。

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（http://localhost:5173）
npm run build      # 生产构建（输出到 dist/）
npm run data:all   # 数据质量校验 + 归一化
```

## 数据来源

- 苹果官网 (apple.com.cn)
- 华为官网 (huawei.com)
- 荣耀官网 (honor.com)
- 小米官网 (mi.com)
- OPPO 官网 (oppo.com) / OPPO 商城 (opposhop.cn)
- vivo 官网 (vivo.com.cn)
- 三星官网 (samsung.com.cn)
- 一加官网 (oneplus.com)
- 真我官网 (realme.com)
- iQOO 官网 (iqoo.com)
- 红魔官网 (nubia.com)
- REDMI 官网 (redmi.com)
- 联想商城 (shop.lenovo.com.cn)

## 更新日志

### 2026-08-14
- 筛选功能完善：处理器筛选标签改为从数据动态生成（前 15 个高频处理器，自动归并 "(for Galaxy)" 等变体）；补全充电协议筛选 UI（PD/PPS/UFCS/QC 等）；屏幕形态新增微曲屏/曲面屏，260 款机型全覆盖
- 数据补全：合并 8 对重复字段，智能批量填充 1987 个通用字段（wifi/bluetooth/nfc/ir/fingerprint/esim/sim_type 等），字段填充率：23 个核心字段 100%
- 新增 CLI 查询工具（cli.py）

### 2026-06-30
- 新增 REDMI K90 Ultra 原始数据（REDMI_K90_Ultra_原始数据_2026-06-30.json）

### 2026-06-27
- 新增 vivo X Fold6 原始数据（vivo_X_Fold6_原始数据_2026-06-27.json）

### 2026-06-15
- 新增荣耀 X70 Pro Max 备份（phone-select-backup-荣耀X70ProMax-2026-06-15.json）

### 2026-06-12
- 相机参数批量修正：华为 Pura 系列、OPPO Reno 系列影像字段补全与校准
- 新增数据质量工具链（bulk_update / check / survey 系列脚本）

### 2026-05-21
- **小米 17 Max** 官方数据修正：重量 245→225g、分辨率 3120×1440→2608×1200、USB 3.2 Gen 2→Gen 1、价格 4,999→4,799 元起、存储移除1TB选项、屏幕类型 OLED→AMOLED、摄像头参数修正（f/1.7→f/1.65 等）、补充星辰通信等特性。数据来自 mi.com 官方商城
- 自动标签修复 15 项

### 2026-05-19
- 新增 **摩托罗拉** 品牌（moto Razr 60/Ultra/Pro、g100/s/Pro、X70 Air）共 7 款
- 新增 **联想** 品牌 + 拯救者 Y70（骁龙8 Gen5、8000mAh、90W）
- 一加系列大规模数据修正：15/15T/13/13T/Ace6/Ace6T/Ace5/Turbo6 全系列（电池、充电、USB、屏幕刷新率等）
- 真我 GT8/GT8 Pro 参数修正（电池 5500→7000mAh、充电/屏幕/摄像头等）
- OPPO 商城同步：新增 17 款在售机型，移除 13 款已下架机型，更新 28 款价格
- 新增商品分类页面同步（Find N/X/Reno/K/A 全系列核对）
- 补全 OPPO K13 Turbo Pro/Turbo/K13s/K13x/K12s 核心参数（来自太平洋电脑网）
- 更新 README，新增数据来源说明

### 2026-05-18
- 全品牌官网逐款核实：vivo、iQOO、OPPO、一加、真我、红魔
- 修复批量价格错误（Reno15 系列价格串号问题）
- 修正品牌命名规范（华为畅享系列补全品牌字段）
- 补充大量 IP 防水等级数据
- 新增 Tags 自动校验逻辑

### 2026-05-13
- UI 全面优化：品牌色带、折叠筛选区、多选价格/尺寸
- 对比弹窗重构：修复布局、雷达图、手机端适配
- 新增 华为 Mate 80 系列 / Pura 90 系列 / nova 15 系列 等新机
- 华为全系官网批量爬取验证
- 处理器命名标准化（骁龙8 Elite 5/1 等）

### 2026-05-09
- 新增 iQOO 15/15 Ultra、vivo X300 系列 等新机
- 参数校验系统上线
- 修复 Word 文档抽取参数格式问题

### 2026-05-08
- 新增折叠屏支持
- 批量补全 NFC/红外/防水标签
- 修复 USB 版本、无线充电等字段错误

### 2026-05-07
- 数据抽离：phones 数组从 HTML 迁移到 `data/phones.json`
- 增加加载状态和错误处理
- 修复部分机型 os 字段换行符问题
- 全部 232 款机型价格覆盖

### 2026-05-06
- 初始版本发布
- 覆盖 12 个品牌 232 款机型
- 支持多维度筛选和排序

## License

MIT License

## 合作及反馈

微信：Greg__ge
