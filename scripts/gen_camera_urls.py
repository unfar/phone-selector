#!/usr/bin/env python3
"""
为缺失摄像头数据的机型生成官网参数页 URL 候选，并批量抓取。
品牌 URL 模式:
- OPPO:  https://www.oppo.com/cn/smartphones/series-{s}/{slug}/specs/
- vivo:  https://m.vivo.com.cn/vivo/param/{slug}
- Samsung: https://www.samsung.com.cn/smartphones/{slug}/specs/
- HONOR: https://www.honor.com/cn/phones/honor-{slug}/spec/
- OnePlus: https://www.oneplus.com/cn/{slug}/specs
- realme: https://www.realme.com/cn/{slug}/specs  (待验证)
- Xiaomi/REDMI: 官网JS渲染, 待定

用法: python3 scripts/gen_camera_urls.py <out.json>
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 品牌 → slug 映射（手动维护旗舰/热门机型）
SLUGS = {
    # HONOR (slug = 去品牌前缀, 小写连字符)
    "HONOR": {
        "荣耀 Magic8 Pro": "magic8-pro",
        "荣耀 Magic8": "magic8",
        "荣耀 Magic8 RSR 保时捷设计": "magic8-rsr",
        "荣耀 WIN": "win",
        "荣耀 WIN Turbo": "win-turbo",
        "荣耀WIN RT": "win-rt",
        "荣耀X80 Pro Max": "x80-pro-max",
        "荣耀X70 Pro Max": "x70-pro-max",
        "荣耀600 Pro": "600-pro",
        "荣耀600 元气版": "600-youth-edition",
        "荣耀X70 Pro": "x70-pro",
        "荣耀Play11 Plus": "play11-plus",
        "荣耀Magic V Flip2": "magic-v-flip2",
        "荣耀畅玩70 Plus": "play70-plus",
        "荣耀X80i": "x80i",
        "荣耀GT Pro": "gt-pro",
    },
    # OnePlus
    "OnePlus": {
        "一加 Ace 6 至尊版": "ace-6-ultra",
        "一加 Ace 6": "ace-6",
        "一加 Ace 6T": "ace-6t",
        "一加 15": "15",
        "一加 15T": "15t",
        "一加 Turbo 6": "turbo-6",
        "一加 Turbo 6V": "turbo-6v",
        "一加 Ace 5 Pro": "ace-5-pro",
        "一加 13": "13",
    },
    # realme (待验证)
    "realme": {
        "Neo8": "neo8",
        "Neo7": "neo7",
        "Neo7 Turbo": "neo7-turbo",
        "GT8": "gt8",
        "GT8 Pro": "gt8-pro",
        "GT7": "gt7",
        "13 Pro+": "13-pro-plus",
    },
}


def slugify(model, brand):
    """把机型名转 slug"""
    s = model
    # 去掉品牌前缀
    for pre in [brand, "HUAWEI", "HONOR", "OPPO", "Xiaomi", "REDMI", "Redmi", "OnePlus", "一加", "荣耀", "真我", "红米"]:
        if s.startswith(pre):
            s = s[len(pre):].strip()
            break
    # 中文→拼音映射（常见词）
    CN = {
        "至尊版": "ultra", "保时捷设计": "rsr", "元气版": "youth-edition",
        "超级版": "super", "标准版": "", "活力版": "lively",
    }
    for k, v in CN.items():
        s = s.replace(k, v)
    # 去符号，转小写连字符
    s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", s)
    return s.strip("-").lower()


def gen_urls():
    data = json.loads((ROOT / "data" / "phones.json").read_text(encoding="utf-8"))
    targets = []
    used = set()

    for brand, slugmap in SLUGS.items():
        for model, slug in slugmap.items():
            p = next((x for x in data if x["model"] == model and x["brand"] == brand), None)
            if not p:
                continue
            if brand == "HONOR":
                url = f"https://www.honor.com/cn/phones/honor-{slug}/spec/"
            elif brand == "OnePlus":
                url = f"https://www.oneplus.com/cn/{slug}/specs"
            elif brand == "realme":
                url = f"https://www.realme.com/cn/{slug}/specs"
            else:
                continue
            if p["id"] in used:
                continue
            used.add(p["id"])
            targets.append({"id": p["id"], "model": p["model"], "brand": brand, "url": url})

    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/camera_targets3.json")
    out.write_text(json.dumps(targets, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"生成 {len(targets)} 个 URL → {out}")
    for t in targets:
        print(f"  [{t['id']}] {t['model']} → {t['url']}")


if __name__ == "__main__":
    gen_urls()
