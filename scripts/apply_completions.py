#!/usr/bin/env python3
"""
安全补全脚本：仅从数据内部已有事实或 notion 整理的官方来源提取，
不引入任何猜测。修改前自动备份，修改后打印变更清单。
用法: python3 scripts/apply_completions.py
"""
import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "phones.json"
sys.path.insert(0, str(ROOT / "scripts"))
from data_quality import completeness_score  # noqa: E402


def backup(data_path: Path) -> str:
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak = ROOT / "data" / f"phones.json.bak.autofix-{ts}"
    bak.write_bytes(data_path.read_bytes())
    return str(bak)


def extract_full_ips(features) -> list:
    """提取 features 中的 IP 等级，处理 'IP66/68/69' 简写。"""
    out = []
    for f in features or []:
        s = str(f)
        m = re.search(r"IP(\d{1,2}X?K?)(?:/(\d{1,2}X?K?)(?:/(\d{1,2}X?K?))?)?", s)
        if m and "/" in s and len(m.group(0)) > 4:
            out.append("IP" + m.group(1))
            for g in m.groups()[1:]:
                if g:
                    out.append("IP" + g)
        else:
            for mm in re.finditer(r"IP(?:\d{1,2}X?K?|X\d{1,2}K?)", s, re.I):
                out.append(mm.group(0).upper())
    return list(dict.fromkeys(out))


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    by_id = {str(p["id"]): p for p in data}
    changes = []

    # ---- 1. ip_rating: 从 features 提取（仅缺失项）----
    ip_targets = ["12", "127", "123", "265", "vivo-x300e", "268", "269", "270"]
    for pid in ip_targets:
        p = by_id.get(pid)
        if p and not p.get("ip_rating"):
            ips = extract_full_ips(p.get("features") or [])
            if ips:
                val = "/".join(ips)
                p["ip_rating"] = val
                changes.append(f"ip_rating [{pid}] {p['model']} → {val}")

    # ---- 2. camera_front: 从 detailed_camera 提取（仅缺失项）----
    front_map = {
        3: "1600万", 2: "16MP", 5: "3200万", 4: "3200万", 6: "5000万",
        10: "1600万", 18: "32MP", 88: "32MP", 169: "16MP", 168: "50MP",
        166: "1600万", 167: "800万", 192: "3200万", 208: "20MP", 214: "16MP", 266: "50MP",
    }
    for pid, val in front_map.items():
        p = by_id.get(str(pid))
        if p and not p.get("camera_front"):
            p["camera_front"] = val
            changes.append(f"camera_front [{pid}] {p['model']} → {val}")

    # ---- 3. network_model: 来自 notion 整理的官方/媒体来源（仅缺失项）----
    nm_map = {
        189: "PKT110", 155: "PPG-AN00", 132: "LMR-AL10", 197: "PLB110",
        67: "PLG110", 100: "V2520A", 54: "MEP-AN00", 149: "AMG-AN00",
        231: "FLC-AN00", 137: "SER-AN00", 45: "PKL110", 87: "PKV110",
        146: "CPH2765", 29: "PMA110",
    }
    for pid, val in nm_map.items():
        p = by_id.get(str(pid))
        if p and not p.get("network_model"):
            p["network_model"] = val
            changes.append(f"network_model [{pid}] {p['model']} → {val}")

    # ---- 4. 重算 completeness_score（全量）----
    for p in data:
        p["completeness_score"] = completeness_score(p)

    if not changes:
        print("无变更")
        return

    bak = backup(DATA)
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"备份: {bak}")
    print(f"共 {len(changes)} 项补全:")
    for c in changes:
        print(f"  {c}")


if __name__ == "__main__":
    main()
