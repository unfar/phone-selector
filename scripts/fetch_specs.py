#!/usr/bin/env python3
"""
健壮的官网参数页抓取器（防中断设计）：
- 单个浏览器实例复用（不每次启动）
- 每页独立超时 + 失败自动重试
- 结果实时落盘 JSON（中断不丢已抓数据）
- 支持断点续抓（跳过已成功条目）

用法:
  python3 scripts/fetch_specs.py <out.json> <url1> <url2> ...
  python3 scripts/fetch_specs.py <out.json> --from-file urls.txt
"""
import json
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
PAGE_TIMEOUT_MS = 20000      # 单页加载超时
WAIT_MS = 3000               # JS 渲染等待
MAX_RETRY = 2                # 失败重试次数
KEYWORDS = ["入网型号", "设备型号", "证书", "型号", "摄像头", "相机", "IMX", "LYT", "S5K", "GN", "HP", "JN", "OV", "f/", "1/"]


def fetch_page(page, url):
    """抓取单页，返回 {url, title, lines} 或 None(最终失败)"""
    for attempt in range(MAX_RETRY + 1):
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT_MS)
            page.wait_for_timeout(WAIT_MS)
            title = page.title()
            body = page.inner_text("body")
            lines = [l.strip() for l in body.split("\n") if l.strip()]
            # 只保留含关键词的行，压缩体积
            kept = []
            for l in lines:
                if any(k in l for k in KEYWORDS):
                    kept.append(l[:200])
            return {"url": url, "title": title, "lines": kept[:60]}
        except Exception as e:
            if attempt < MAX_RETRY:
                time.sleep(2 * (attempt + 1))
                continue
            return {"url": url, "error": str(e)[:150]}


def load_existing(out_path: Path):
    if out_path.exists():
        try:
            return json.loads(out_path.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    out_path = Path(sys.argv[1])
    if sys.argv[2] == "--from-file" and len(sys.argv) >= 4:
        urls = [l.strip() for l in Path(sys.argv[3]).read_text().splitlines() if l.strip()]
    else:
        urls = sys.argv[2:]

    results = load_existing(out_path)
    todo = [u for u in urls if u not in results]
    print(f"共 {len(urls)} 个 URL, 已完成 {len(results)}, 待抓 {len(todo)}")

    if not todo:
        print("全部完成")
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(user_agent=UA, locale="zh-CN")
        page = ctx.new_page()
        try:
            for i, url in enumerate(todo):
                print(f"[{i+1}/{len(todo)}] {url[:80]}")
                r = fetch_page(page, url)
                results[url] = r
                # 实时落盘
                out_path.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
                status = "✓" if "lines" in r else f"✗ {r.get('error','')[:50]}"
                print(f"    {status}")
        finally:
            browser.close()

    print(f"\n完成: {len(results)}/{len(urls)} 已保存到 {out_path}")


if __name__ == "__main__":
    main()
