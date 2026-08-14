#!/usr/bin/env python3
"""
从 detailed_camera 提取全镜头结构化影像字段（第1层：内部数据榨干）。
不引入任何猜测，只从已有文本提取。

新增字段:
- camera_uw_aperture    超广角光圈
- camera_uw_sensor      超广角传感器
- camera_uw_focal       超广角焦距mm
- camera_tele_aperture  长焦/潜望光圈
- camera_tele_sensor    长焦/潜望传感器
- camera_tele_size      长焦/潜望尺寸
- camera_tele_focal     长焦/潜望焦距mm
- camera_tele_zoom      长焦/潜望光学变焦倍数
- camera_front_aperture 前置光圈
- camera_front_sensor   前置传感器
- camera_main_mp        主摄像素(MP)
- camera_main_focal     主摄焦距mm
"""
import json
import re
from datetime import datetime
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "phones.json"

SENSOR_PATTERNS = [
    r"(光影猎人\d+[A-Z]?[A-Za-z]*)",
    r"(索尼\s*(?:IMX|LYT)[-\dA-Z]*)",
    r"(三星\s*(?:GN|HP|JN|S5K)[-\dA-Z]*)",
    r"(豪威\s*OV[\dA-Z]*)",
    r"\b(LYT-\d{3}[A-Z]?)\b",
    r"\b(IMX\d{3,4}[A-Z]?)\b",
    r"\b(OV\d{2}[A-Z]\d?)\b",
    r"\b(S5K[A-Z0-9]+)\b",
    r"\b(GN\d[A-Z]?)\b",
    r"\b(HP\d[A-Z]?)\b",
    r"\b(JN\d[A-Z]?)\b",
]

APERTURE_RE = re.compile(r"f/\d+\.?\d*")
SIZE_RE = re.compile(r"1/\d+\.?\d*\"?")
FOCAL_RE = re.compile(r"(\d{2,3})\s*mm")
ZOOM_RE = re.compile(r"(\d+(?:\.\d+)?)\s*[xX×]")
MP_RE = re.compile(r"(\d+)\s*MP|(\d+\.?\d*)\s*亿像素|(\d{2,4})万")


def find_sensor(text):
    for pat in SENSOR_PATTERNS:
        m = re.search(pat, text)
        if m:
            return re.sub(r"\s+", "", m.group(1))
    return None


def find_mp(text):
    """提取像素（统一为 MP 单位）: 50MP→50, 5000万→50, 2亿→200"""
    # 亿像素: 2亿→200MP
    m = re.search(r"(\d+\.?\d*)\s*亿", text)
    if m:
        return round(float(m.group(1)) * 100)
    # XMP / X MP
    m = re.search(r"(\d+)\s*MP", text)
    if m:
        return int(m.group(1))
    # X万(像素): 800万→8MP, 5000万→50MP, 500万→5MP
    m = re.search(r"(\d{2,4})\s*万", text)
    if m:
        return int(m.group(1)) // 100
    return None


def extract_lens_fields(seg):
    """从单个镜头段提取字段"""
    return {
        "sensor": find_sensor(seg),
        "size": SIZE_RE.search(seg).group(0) if SIZE_RE.search(seg) else None,
        "aperture": APERTURE_RE.search(seg).group(0) if APERTURE_RE.search(seg) else None,
        "focal": FOCAL_RE.search(seg).group(1) + "mm" if FOCAL_RE.search(seg) else None,
    }


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    changes = []

    for p in data:
        dc = p.get("detailed_camera") or ""
        if not dc:
            continue
        segs = dc.split("|")

        # 定位各镜头段
        main_seg = uw_seg = tele_seg = front_seg = ""
        for seg in segs:
            if not main_seg and ("主摄" in seg or "广角" in seg and "超" not in seg):
                main_seg = seg
            if not uw_seg and ("超广" in seg or "超广角" in seg):
                uw_seg = seg
            if not tele_seg and ("潜望" in seg or "长焦" in seg):
                tele_seg = seg
            if not front_seg and "前置" in seg:
                front_seg = seg

        # 主摄像素/焦距
        if not p.get("camera_main_mp") and main_seg:
            mp = find_mp(main_seg)
            if mp:
                p["camera_main_mp"] = mp
                changes.append(f"camera_main_mp [{p['id']}] {p['model']} → {mp}MP")
        if not p.get("camera_main_focal") and main_seg:
            fc = FOCAL_RE.search(main_seg)
            if fc:
                p["camera_main_focal"] = fc.group(1) + "mm"
                changes.append(f"camera_main_focal [{p['id']}] {p['model']} → {fc.group(1)}mm")

        # 超广角
        if uw_seg:
            f = extract_lens_fields(uw_seg)
            if f["aperture"] and not p.get("camera_uw_aperture"):
                p["camera_uw_aperture"] = f["aperture"]
                changes.append(f"camera_uw_aperture [{p['id']}] {p['model']} → {f['aperture']}")
            if f["sensor"] and not p.get("camera_uw_sensor"):
                p["camera_uw_sensor"] = f["sensor"]
                changes.append(f"camera_uw_sensor [{p['id']}] {p['model']} → {f['sensor']}")
            if f["focal"] and not p.get("camera_uw_focal"):
                p["camera_uw_focal"] = f["focal"]
                changes.append(f"camera_uw_focal [{p['id']}] {p['model']} → {f['focal']}")

        # 长焦/潜望
        if tele_seg:
            f = extract_lens_fields(tele_seg)
            if f["aperture"] and not p.get("camera_tele_aperture"):
                p["camera_tele_aperture"] = f["aperture"]
                changes.append(f"camera_tele_aperture [{p['id']}] {p['model']} → {f['aperture']}")
            if f["sensor"] and not p.get("camera_tele_sensor"):
                p["camera_tele_sensor"] = f["sensor"]
                changes.append(f"camera_tele_sensor [{p['id']}] {p['model']} → {f['sensor']}")
            if f["size"] and not p.get("camera_tele_size"):
                p["camera_tele_size"] = f["size"]
                changes.append(f"camera_tele_size [{p['id']}] {p['model']} → {f['size']}")
            if f["focal"] and not p.get("camera_tele_focal"):
                p["camera_tele_focal"] = f["focal"]
                changes.append(f"camera_tele_focal [{p['id']}] {p['model']} → {f['focal']}")
            if not p.get("camera_tele_zoom"):
                zm = ZOOM_RE.search(tele_seg)
                if zm:
                    p["camera_tele_zoom"] = zm.group(1) + "x"
                    changes.append(f"camera_tele_zoom [{p['id']}] {p['model']} → {zm.group(1)}x")

        # 前置
        if front_seg:
            f = extract_lens_fields(front_seg)
            if f["aperture"] and not p.get("camera_front_aperture"):
                p["camera_front_aperture"] = f["aperture"]
                changes.append(f"camera_front_aperture [{p['id']}] {p['model']} → {f['aperture']}")
            if f["sensor"] and not p.get("camera_front_sensor"):
                p["camera_front_sensor"] = f["sensor"]
                changes.append(f"camera_front_sensor [{p['id']}] {p['model']} → {f['sensor']}")

    if not changes:
        print("无变更")
        return

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak = DATA.parent / f"phones.json.bak.camlens-{ts}"
    bak.write_bytes(DATA.read_bytes())

    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"备份: {bak}")
    print(f"共 {len(changes)} 项提取")
    by_type = {}
    for c in changes:
        k = c.split(" ")[0]
        by_type[k] = by_type.get(k, 0) + 1
    for k, v in sorted(by_type.items()):
        print(f"  {k}: {v}")
    for c in changes[:15]:
        print(f"  {c}")


if __name__ == "__main__":
    main()
