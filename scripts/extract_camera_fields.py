#!/usr/bin/env python3
"""
从 detailed_camera 提取结构化影像字段（主摄传感器/尺寸/光圈）。
只从数据内部已有事实提取，不引入猜测。修改前自动备份。
"""
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "phones.json"

# 传感器名称模式（按优先级）
SENSOR_PATTERNS = [
    r"(光影猎人\d+[A-Z]?[A-Za-z]*)",          # 光影猎人800 / 光影猎人950
    r"(索尼\s*(?:IMX|LYT)[-\d]*)",             # 索尼IMX921 / 索尼LYT-808
    r"(三星\s*(?:GN|HP|JN)[-\dA-Z]*)",         # 三星GN5 / 三星HP5 / 三星JN1
    r"(豪威\s*OV[\dA-Z]*)",                    # 豪威OV50X
    r"\b(IMX\d{3,4})\b",                       # IMX906
    r"\b(LYT-\d{3})\b",                        # LYT-600
    r"\b(OV\d{2}[A-Z]\d?)\b",                  # OV64B
    r"\b(GN\d)\b",                             # GN5
    r"\b(HP\d[A-Z]?)\b",                       # HP9
    r"\b(JN\d)\b",                             # JN1
]

SIZE_PATTERN = r"1/\d+\.?\d*\"?"
APERTURE_PATTERN = r"f/\d+\.?\d*"


def clean_sensor(s: str) -> str:
    """清理传感器名：去掉多余空格，统一格式"""
    s = re.sub(r"\s+", "", s)
    return s


def extract_main(dc: str) -> str:
    """取主摄段（第一个 | 分隔段）"""
    if not dc:
        return ""
    return dc.split("|")[0].strip()


def find_sensor(text: str):
    for pat in SENSOR_PATTERNS:
        m = re.search(pat, text)
        if m:
            return clean_sensor(m.group(1))
    return None


def find_size(text: str):
    m = re.search(SIZE_PATTERN, text)
    return m.group(0) if m else None


def find_aperture(text: str):
    m = re.search(APERTURE_PATTERN, text)
    return m.group(0) if m else None


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    changes = []

    for p in data:
        dc = p.get("detailed_camera") or ""
        main = extract_main(dc)
        if not main:
            continue

        # 主摄
        if not p.get("camera_main_sensor"):
            s = find_sensor(main)
            if s:
                p["camera_main_sensor"] = s
                changes.append(f"camera_main_sensor [{p['id']}] {p['model']} → {s}")
        if not p.get("camera_main_size"):
            sz = find_size(main)
            if sz:
                p["camera_main_size"] = sz
                changes.append(f"camera_main_size [{p['id']}] {p['model']} → {sz}")
        if not p.get("camera_main_aperture"):
            ap = find_aperture(main)
            if ap:
                p["camera_main_aperture"] = ap
                changes.append(f"camera_main_aperture [{p['id']}] {p['model']} → {ap}")

    if not changes:
        print("无变更")
        return

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak = ROOT / "data" / f"phones.json.bak.camera-{ts}"
    bak.write_bytes(DATA.read_bytes())

    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"备份: {bak}")
    print(f"共 {len(changes)} 项提取:")
    # 按机型汇总显示
    by_type = {}
    for c in changes:
        key = c.split(" ")[0]
        by_type.setdefault(key, 0)
        by_type[key] += 1
    for k, v in by_type.items():
        print(f"  {k}: {v} 项")
    # 显示前 20 条
    for c in changes[:20]:
        print(f"  {c}")


if __name__ == "__main__":
    main()
