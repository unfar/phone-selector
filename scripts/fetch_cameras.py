#!/usr/bin/env python3
"""
从各品牌官网参数页批量提取摄像头数据（直读官网文本，不经OCR）。
结果落盘 JSON，支持断点续抓。

用法: python3 scripts/fetch_cameras.py <out.json> <urls.json>
urls.json 格式: [{"id": 17, "model": "OPPO Reno16 Pro", "url": "..."}, ...]
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0"
PAGE_TIMEOUT = 40000
WAIT_MS = 3500

# 摄像头相关关键词
CAM_KEYWORDS = ["摄像头", "广角", "长焦", "潜望", "超广", "微距", "光圈", "f/", "等效焦距", "变焦", "像素", "MP"]


def extract_camera_lines(text: str) -> list:
    """从页面文本提取摄像头相关行"""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    out = []
    in_cam = False
    for l in lines:
        if "摄像头" in l and ("后置" in l or "前置" in l or "配置" in l):
            in_cam = True
        elif in_cam and any(k in l for k in ["电池", "网络", "处理器", "屏幕", "系统", "尺寸", "重量", "包装"]):
            in_cam = False
        if in_cam or any(k in l for k in CAM_KEYWORDS):
            if len(l) < 200:
                out.append(l)
        if len(out) > 40:
            break
    return out


def fetch_cameras(urls, out_path):
    results = {}
    if out_path.exists():
        try:
            results = json.loads(out_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    todo = [u for u in urls if str(u["id"]) not in results]
    print(f"共 {len(urls)} 款, 已完成 {len(results)}, 待抓 {len(todo)}")

    if not todo:
        print("全部完成")
        return results

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(user_agent=UA, locale="zh-CN")
        page = ctx.new_page()
        try:
            for i, item in enumerate(todo):
                print(f"[{i+1}/{len(todo)}] {item['model']} ({item['url'][:60]})")
                try:
                    page.goto(item["url"], wait_until="domcontentloaded", timeout=PAGE_TIMEOUT)
                    page.wait_for_timeout(WAIT_MS)
                    text = page.inner_text("body")
                    cam = extract_camera_lines(text)
                    results[str(item["id"])] = {
                        "model": item["model"],
                        "url": item["url"],
                        "title": page.title(),
                        "camera": cam,
                    }
                except Exception as e:
                    results[str(item["id"])] = {"model": item["model"], "url": item["url"], "error": str(e)[:120]}
                out_path.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
                status = "✓" if "camera" in results[str(item["id"])] else "✗"
                print(f"    {status}")
        finally:
            browser.close()
    return results


if __name__ == "__main__":
    out = Path(sys.argv[1])
    urls = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    fetch_cameras(urls, out)
