#!/usr/bin/env python3
"""
讯飞 MaaS OCR 工具 —— 手机参数截图 → 文字提取

基于讯飞 MaaS 的 HunyuanOCR 模型（xophunyuanocr）：
- 支持图片 → 文字提取（含参数识别）
- 也可用 PaddleOCR-VL-1.6（xoppaddleocrv16，纯文字）

用法:
  python3 scripts/xfyun_ocr.py <image_path> [提示词]
  python3 scripts/xfyun_ocr.py <image_path> --json        # JSON 输出
  python3 scripts/xfyun_ocr.py <image_path> --model paddle # 用 PaddleOCR

凭证: 通过环境变量 XFYUN_API_KEY / XFYUN_API_SECRET 提供，
      或直接修改下方 CREDENTIALS（不推荐提交到 git）。
"""
import base64
import json
import os
import sys

import requests

BASE_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2"

# 优先环境变量，fallback 到内置（注意: 不要提交真实密钥到 git）
API_KEY = os.environ.get("XFYUN_API_KEY", "ce9fc4b20201d1a57d48fa5018ddc899")
API_SECRET = os.environ.get("XFYUN_API_SECRET", "MzdhZDA4Y2RmMGNjMTAzOGYzNDExNTQ2")

DEFAULT_PROMPT = (
    "提取图片中的文字信息。如果是手机参数页面，重点提取摄像头相关参数"
    "（像素、光圈 f/、传感器型号、传感器尺寸 1/x.x、焦距、防抖等），按顺序输出。"
)


def ocr(image_path, prompt=None, model="xophunyuanocr", max_tokens=8192):
    """调用讯飞 OCR，返回识别文本"""
    with open(image_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    # 根据图片格式设置 mime
    ext = image_path.lower().rsplit(".", 1)[-1]
    mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "webp": "webp"}.get(ext, "png")

    resp = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}:{API_SECRET}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": ""},
                {"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/{mime};base64,{img_b64}"}},
                    {"type": "text", "text": prompt or DEFAULT_PROMPT},
                ]},
            ],
            "max_tokens": max_tokens,
            "temperature": 0,
        },
        timeout=120,
    )
    if resp.status_code != 200:
        return {"error": f"HTTP {resp.status_code}: {resp.text[:300]}"}
    data = resp.json()
    return {
        "text": data["choices"][0]["message"]["content"],
        "usage": data.get("usage", {}),
        "model": data.get("model", model),
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    img = sys.argv[1]
    prompt = None
    as_json = False
    model = "xophunyuanocr"
    i = 2
    while i < len(sys.argv):
        a = sys.argv[i]
        if a == "--json":
            as_json = True
        elif a == "--model" and i + 1 < len(sys.argv):
            model = "xoppaddleocrv16" if sys.argv[i + 1] == "paddle" else sys.argv[i + 1]
            i += 1
        elif not a.startswith("--"):
            prompt = a
        i += 1

    result = ocr(img, prompt, model)
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        if "error" in result:
            print(f"错误: {result['error']}")
        else:
            print(result["text"])
            print(f"\n[用量] {result.get('usage', {})}")


if __name__ == "__main__":
    main()
