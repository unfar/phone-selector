#!/usr/bin/env python3
"""
phone-selector 数据质量基建
- validate: 质量体检
- normalize: 标准化（日期/IP/处理器/标签重建）+ 双文件同步
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "phones.json"
PUBLIC = ROOT / "public" / "data" / "phones.json"
BACKUP_DIR = ROOT / "data"

IP_RE = re.compile(r"IP(?:\d{1,2}X?K?|X\d{1,2}K?)", re.I)

# 处理器命名统一
PROC_MAP = [
    (re.compile(r"第五代骁龙8\s*至尊版|骁龙8\s*Elite\s*2|骁龙8\s*Elite2"), "骁龙8 Elite 5"),
    (re.compile(r"骁龙8\s*至尊版|骁龙8\s*Elite\s*1(?!\d)|骁龙8\s*Elite$"), "骁龙8 Elite 1"),
    (re.compile(r"骁龙7s\s*Gen\s*(\d+)"), r"骁龙7s Gen\1"),
    (re.compile(r"天玑9500s", re.I), "天玑9500s"),
]


def load_phones(path: Path = DATA) -> list:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_phones(phones: list, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(phones, f, ensure_ascii=False, indent=2)
        f.write("\n")


def backup(path: Path = DATA) -> Path:
    bak = path.with_suffix(path.suffix + ".bak_quality")
    shutil.copy2(path, bak)
    return bak


def extract_ips(features) -> list[str]:
    levels = []
    for f in features or []:
        if not isinstance(f, str):
            continue
        for m in IP_RE.findall(f):
            levels.append(m.upper())
    # 去重保序
    out = []
    seen = set()
    for x in levels:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def normalize_features(features) -> list:
    if not features:
        return []
    ips = extract_ips(features)
    non_ip = []
    for f in features:
        if not isinstance(f, str):
            continue
        # 跳过旧 IP 拆分格式与原始 IP，后面统一回写
        if f.startswith("防尘") or f.startswith("防水") or IP_RE.fullmatch(f.strip()):
            continue
        # 也跳过 features 里混着的 "IP68防尘抗水" 这类
        if IP_RE.search(f) and ("防尘" in f or "防水" in f or "抗水" in f):
            continue
        non_ip.append(f)
    # 原始 IP 放前面，便于阅读
    return ips + non_ip


def normalize_release_date(rd: str | None) -> str | None:
    if not rd:
        return rd
    rd = str(rd).strip()
    if re.fullmatch(r"\d{4}-\d{2}$", rd):
        return rd + "-01"
    if re.fullmatch(r"\d{4}-\d{1,2}-\d{1,2}$", rd):
        y, m, d = rd.split("-")
        return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"
    return rd


def normalize_processor(proc: str | None) -> str | None:
    if not proc:
        return proc
    s = str(proc).strip()
    s = re.sub(r"\s+", " ", s)
    for pat, rep in PROC_MAP:
        if pat.search(s):
            s = pat.sub(rep, s)
            break
    # 清理重复空格
    return s.strip()


def rebuild_tags(p: dict) -> list:
    tags = []
    feats = " ".join(str(f) for f in (p.get("features") or []))
    proc = str(p.get("processor") or "")

    # 功能标签
    if p.get("has_tele"):
        tags.append("潜望长焦")
    ww = p.get("wireless_charging_w") or 0
    try:
        ww = float(ww)
    except Exception:
        ww = 0
    if ww > 0:
        tags.append("无线充电")
    bat = p.get("battery_mah") or 0
    try:
        bat = float(bat)
    except Exception:
        bat = 0
    if bat >= 6500:
        tags.append("6500mAh+")
    wt = p.get("weight_g") or 0
    try:
        wt = float(wt)
    except Exception:
        wt = 0
    if 0 < wt <= 200:
        tags.append("≤200g")

    usb = str(p.get("usb_version") or "")
    if "USB 3" in usb or "USB3" in usb or "3.2" in usb or "3.1" in usb or "3.0" in usb:
        tags.append("USB3.0")

    if any(x in feats for x in ["NFC", "nfc"]):
        tags.append("NFC")
    if "红外" in feats:
        tags.append("红外")
    if extract_ips(p.get("features")):
        tags.append("防尘抗水")
    if "散热风扇" in feats or "风扇" in (p.get("tags") or []):
        # 仅当 features 明确或旧 tags 已有
        if "散热风扇" in feats or "散热风扇" in (p.get("tags") or []):
            tags.append("散热风扇")
    if "有线投屏" in feats or "DP" in usb or "投屏" in feats or "有线投屏" in (p.get("tags") or []):
        if "有线投屏" in (p.get("tags") or []) or "投屏" in feats or "DP" in usb:
            tags.append("有线投屏")

    # 处理器标签（保留已有 CPU 标签 + 常见映射）
    old_tags = p.get("tags") or []
    cpu_keep = []
    for t in old_tags:
        if any(k in str(t) for k in ["骁龙", "天玑", "麒麟", "Elite", "Gen", "A1", "A2", "Exynos", "Helio", "入门芯片", "中低端芯片"]):
            cpu_keep.append(t)
    # 若没有 CPU 标签，尝试放 processor 简写
    if not cpu_keep and proc:
        # 不自动塞太长字符串，只放关键旗舰名
        for key in ["骁龙8 Elite 5", "骁龙8 Elite 1", "骁龙8 Gen5", "天玑9500", "天玑9400", "麒麟9030", "麒麟9020", "A19", "A18"]:
            if key in proc:
                cpu_keep.append(key)
                break

    # 合并保序去重
    out = []
    seen = set()
    for t in cpu_keep + tags:
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def completeness_score(p: dict) -> int:
    checks = [
        bool(p.get("processor")),
        bool(p.get("price")),
        bool(p.get("battery_mah")),
        bool(p.get("weight_g")),
        bool(p.get("release_date") and len(str(p.get("release_date"))) >= 10),
        bool(p.get("ram")),
        bool(p.get("storage")),
        bool(p.get("usb_version")),
        bool(p.get("os")),
        bool(p.get("resolution")),
        bool(p.get("refresh_hz")),
        bool(p.get("network_model")),
        bool(p.get("detailed_camera")),
        bool(extract_ips(p.get("features"))),
        bool(p.get("charge_protocols")),
        bool(p.get("screen_form")),
    ]
    return round(100 * sum(1 for c in checks if c) / len(checks))


def normalize_all(phones: list) -> tuple[list, dict]:
    stats = Counter()
    out = []
    for p in phones:
        p = deepcopy(p)
        # 日期
        old_rd = p.get("release_date")
        new_rd = normalize_release_date(old_rd)
        if old_rd != new_rd:
            p["release_date"] = new_rd
            if old_rd and re.fullmatch(r"\d{4}-\d{2}$", str(old_rd)):
                p["date_precision"] = "month"
            stats["release_date_fixed"] += 1

        # 处理器
        old_proc = p.get("processor")
        new_proc = normalize_processor(old_proc)
        if old_proc != new_proc:
            p["processor"] = new_proc
            stats["processor_fixed"] += 1

        # IP / features
        old_feats = p.get("features") or []
        new_feats = normalize_features(old_feats)
        if old_feats != new_feats:
            p["features"] = new_feats
            stats["features_ip_normalized"] += 1

        # wireless null -> 0
        if p.get("wireless_charging_w") is None:
            p["wireless_charging_w"] = 0
            stats["wireless_null_to_0"] += 1

        # tags rebuild
        new_tags = rebuild_tags(p)
        old_tags = p.get("tags") or []
        if set(old_tags) != set(new_tags) or old_tags != new_tags:
            p["tags"] = new_tags
            stats["tags_rebuilt"] += 1

        # completeness
        p["completeness_score"] = completeness_score(p)
        out.append(p)
    return out, stats


def validate(phones: list) -> dict:
    errors, warnings = [], []
    id_counts = Counter(p.get("id") for p in phones)
    model_counts = Counter(p.get("model") for p in phones)
    for k, v in id_counts.items():
        if v > 1:
            errors.append(f"重复 ID: {k} x{v}")
    for k, v in model_counts.items():
        if v > 1:
            warnings.append(f"重复机型名: {k} x{v}")

    for p in phones:
        pid, brand, model = p.get("id"), p.get("brand"), p.get("model")
        if not p.get("price"):
            errors.append(f"[缺失] ID {pid} {brand} {model}: 价格为空")
        if not p.get("processor"):
            errors.append(f"[缺失] ID {pid} {brand} {model}: 处理器为空")
        if not p.get("battery_mah"):
            warnings.append(f"[缺失] ID {pid} {brand} {model}: 电池为空")
        if not p.get("weight_g"):
            warnings.append(f"[缺失] ID {pid} {brand} {model}: 重量为空")

        rd = str(p.get("release_date") or "")
        if rd and len(rd) < 10:
            warnings.append(f"[日期] ID {pid} {model}: release_date={rd} 非 YYYY-MM-DD")

        # 旧 IP 格式残留
        for f in p.get("features") or []:
            if isinstance(f, str) and (f.startswith("防尘") or f.startswith("防水")):
                warnings.append(f"[IP格式] ID {pid} {model}: 仍有旧格式 {f}")
                break

        # 标签一致性
        tags = set(p.get("tags") or [])
        bat = p.get("battery_mah") or 0
        wt = p.get("weight_g") or 0
        ww = p.get("wireless_charging_w") or 0
        try:
            bat = float(bat); wt = float(wt); ww = float(ww)
        except Exception:
            pass
        if bat >= 6500 and "6500mAh+" not in tags:
            warnings.append(f"[标签] ID {pid} {model}: 缺 6500mAh+")
        if ww > 0 and "无线充电" not in tags:
            warnings.append(f"[标签] ID {pid} {model}: 缺 无线充电")
        if p.get("has_tele") and "潜望长焦" not in tags:
            warnings.append(f"[标签] ID {pid} {model}: 缺 潜望长焦")
        if 0 < wt <= 200 and "≤200g" not in tags:
            warnings.append(f"[标签] ID {pid} {model}: 缺 ≤200g")

    # coverage
    fields = [
        "network_model", "os", "refresh_hz", "resolution", "usb_version",
        "charge_protocols", "ram", "storage", "detailed_camera"
    ]
    coverage = {}
    n = len(phones)
    for f in fields:
        present = sum(1 for p in phones if p.get(f) not in (None, "", [], 0, False))
        coverage[f] = {"present": present, "missing": n - present, "pct": round(100 * present / n, 1) if n else 0}

    scores = [p.get("completeness_score", 0) for p in phones]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    low = sorted(
        [{"id": p.get("id"), "model": p.get("model"), "score": p.get("completeness_score", 0)} for p in phones],
        key=lambda x: x["score"]
    )[:15]

    return {
        "total": n,
        "errors": errors,
        "warnings": warnings,
        "coverage": coverage,
        "avg_completeness": avg_score,
        "lowest_completeness": low,
    }


def print_report(report: dict, title: str = "数据质量报告"):
    print("=" * 60)
    print(title)
    print("=" * 60)
    print(f"机型总数: {report['total']}")
    print(f"平均完整度: {report['avg_completeness']}")
    print(f"错误: {len(report['errors'])} | 警告: {len(report['warnings'])}")
    print("\n字段覆盖率:")
    for f, c in report["coverage"].items():
        print(f"  {f:18s} {c['present']:3d}/{report['total']} ({c['pct']}%)  missing={c['missing']}")
    print("\n完整度最低 10 款:")
    for x in report["lowest_completeness"][:10]:
        print(f"  [{x['score']:>3}] ID {x['id']} {x['model']}")
    if report["errors"]:
        print("\n错误样例:")
        for e in report["errors"][:20]:
            print(" ", e)
    if report["warnings"]:
        print("\n警告样例:")
        for w in report["warnings"][:25]:
            print(" ", w)


def sync_public(phones: list):
    save_phones(phones, DATA)
    save_phones(phones, PUBLIC)
    a = load_phones(DATA)
    b = load_phones(PUBLIC)
    if a != b:
        raise RuntimeError("双文件同步失败：data 与 public 不一致")


def main():
    parser = argparse.ArgumentParser(description="phone-selector data quality toolkit")
    parser.add_argument("action", choices=["validate", "normalize", "all"], help="validate | normalize | all")
    args = parser.parse_args()

    phones = load_phones()
    if args.action in ("validate", "all"):
        report = validate(phones)
        print_report(report, "校验（标准化前）" if args.action == "all" else "校验")

    if args.action in ("normalize", "all"):
        bak = backup(DATA)
        print(f"\n已备份: {bak}")
        normalized, stats = normalize_all(phones)
        sync_public(normalized)
        print("标准化统计:")
        for k, v in sorted(stats.items(), key=lambda x: -x[1]):
            print(f"  {k}: {v}")
        report2 = validate(normalized)
        print_report(report2, "校验（标准化后）")
        print("\n✅ 已写入 data/phones.json 与 public/data/phones.json")


if __name__ == "__main__":
    main()
