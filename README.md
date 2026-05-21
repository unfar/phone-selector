# 📱 智能手机选购助手

基于官方数据的多维度手机筛选工具，帮助你找到最适合的手机。

## 在线访问

**GitHub Pages：** [https://unfar.github.io/phone-selector/](https://unfar.github.io/phone-selector/)

## 功能特点

- **284 款机型**：覆盖苹果、华为、小米、OPPO、vivo、三星等 14 个品牌
- **100% 价格覆盖**：所有机型均收录官方起售价
- **多维度筛选**：品牌、屏幕形态、处理器、特性标签（可多选叠加）
- **丰富标签**：潜望长焦、大电池 6500mAh+、轻薄 ≤200g、防水、NFC、红外、USB3.0、无线充电、散热风扇等
- **9 种排序**：最新发布、价格、电池容量、重量、屏幕大小、快充功率、品牌 A-Z
- **详细参数**：处理器、屏幕、电池、充电、USB 版本、重量、系统、摄像头等

## 项目结构

```
phone-selector/
├── index.html          # 主入口（GitHub Pages 读取此文件）
├── data/
│   └── phones.json     # 手机数据（JSON 格式，便于维护）
├── style.css           # 样式表
├── script.js           # 前端逻辑
├── README.md
└── data_validator.py   # 数据校验工具
```

数据存储在 `data/phones.json` 中，页面通过 fetch 异步加载，便于后续更新数据时无需修改页面逻辑。

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
