# 讯飞 OCR 工具使用说明

## 用途
把手机参数截图（官网/电商页）转成文字，用于核对/补全 `data/phones.json` 中的参数，
特别是摄像头数据（像素、光圈 f/、传感器型号、尺寸、焦距）——这些数据主库中常来自
非官方来源，可能与官网不一致。

## 凭证
- 服务: 讯飞 MaaS（maas-api.cn-huabei-1.xf-yun.com）
- 模型: `xophunyuanocr`（HunyuanOCR 1B，多模态，推荐）/ `xoppaddleocrv16`（纯文字）
- 认证: `Bearer <APIKey>:<APISecret>`
- 凭证配置在 `scripts/xfyun_ocr.py` 中（或环境变量 XFYUN_API_KEY / XFYUN_API_SECRET）
- ⚠️ 注意: 真实密钥不要提交到公开仓库

## 用法
```bash
# 基本识别（图片 → 文字）
python3 scripts/xfyun_ocr.py screenshot.png

# 指定提示词（提取摄像头参数）
python3 scripts/xfyun_ocr.py screenshot.png "提取摄像头参数(像素/光圈/传感器/尺寸/焦距)"

# JSON 输出
python3 scripts/xfyun_ocr.py screenshot.png --json

# 用 PaddleOCR（纯文字）
python3 scripts/xfyun_ocr.py screenshot.png --model paddle
```

## 推荐流程（核对手机参数）
1. 用浏览器打开官网参数页（Playwright 截图，见 scripts/fetch_specs.py）
2. 截取摄像头/规格区域
3. 运行本工具 OCR 提取文字
4. **再用浏览器直读官网文本核实**（OCR 可能有识别误差，重要字段以官网文本为准）
5. 与主数据 data/phones.json 对比，修正不一致项

## 参数限制
- max_tokens ≤ 8192（超出报 SchemaCheckError）
- temperature = 0 适合 OCR
- 系统提示词建议为空字符串

## 已验证案例
- OPPO Reno16 Pro: OCR 发现主库 f/1.7→f/1.8、超广 f/2.2→f/2.0、长焦 70mm→80mm 等错误，
  经官网文本核实后修正。OCR 与官网文本结果一致。
