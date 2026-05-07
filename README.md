# 📱 智能手机选购助手

基于官方数据的多维度手机筛选工具，帮助你找到最适合的手机。

## 在线访问

**GitHub Pages：** [https://unfar.github.io/phone-selector/](https://unfar.github.io/phone-selector/)

## 功能特点

- **232 款机型**：覆盖苹果、华为、小米、OPPO、vivo、三星等 12 个品牌
- **100% 价格覆盖**：所有机型均收录官方起售价
- **多维度筛选**：品牌、屏幕形态、处理器、特性标签（可多选叠加）
- **丰富标签**：潜望长焦、大电池 6500mAh+、轻薄 ≤200g、防水、NFC、红外、USB3.0、无线充电、散热风扇等
- **9 种排序**：最新发布、价格、电池容量、重量、屏幕大小、快充功率、品牌 A-Z
- **详细参数**：处理器、屏幕、电池、充电、USB 版本、重量、系统、摄像头等

## 项目结构

```
phone-selector/
├── index.html          # 主入口（GitHub Pages 读取此文件）
├── phone-selector.html # 桌面版本
├── data/
│   └── phones.json     # 手机数据（JSON 格式，便于维护）
├── README.md
└── upload-to-github.sh # 上传脚本
```

数据存储在 `data/phones.json` 中，页面通过 fetch 异步加载，便于后续更新数据时无需修改页面逻辑。

## 数据来源

- 苹果官网 (apple.com.cn)
- 华为官网 (huawei.com)
- 荣耀官网 (honor.com)
- 小米官网 (mi.com)
- OPPO 官网 (oppo.com)
- vivo 官网 (vivo.com.cn)
- 三星官网 (samsung.com.cn)
- 一加官网 (oneplus.com)
- 真我官网 (realme.com)
- iQOO 官网 (iqoo.com)
- 红魔官网 (nubia.com)
- REDMI 官网 (redmi.com)

## 更新日志

### 2026-05-07
- 数据抽离：phones 数组从 HTML 迁移到 `data/phones.json`
- 增加加载状态和错误处理
- 修复部分机型 os 字段换行符问题
- 更新 README 文档
- 全部 232 款机型价格覆盖

### 2026-05-06
- 初始版本发布
- 覆盖 12 个品牌 232 款机型
- 支持多维度筛选和排序

## License

MIT License

## 合作及反馈

微信：Greg__ge
