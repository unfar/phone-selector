#!/usr/bin/env python3
"""电商参考价数据工具（人工/CSV 导入 + 历史快照 + 校验 + 同步）。

用法：
  python3 scripts/prices.py set --id 466 --platform jd --price 5499 --shop 京东自营 \
      --url https://item.jd.com/xxx.html --note "首发价" --source-url https://...
  python3 scripts/prices.py import --file prices.csv
  python3 scripts/prices.py remove --id 466 --platform jd
  python3 scripts/prices.py validate
  python3 scripts/prices.py report
  python3 scripts/prices.py sync            # data/prices.json -> public/data/prices.json
  python3 scripts/prices.py fetch           # 预留：联盟 API（需环境变量），未配置会提示

数据文件 data/prices.json：
{
  "updated_at": "...",
  "platforms": {"jd": {"name": "京东", "search_url": "..."}, ...},
  "items": {"466": {"jd": {"price": 5499, "shop": "京东自营", "url": "...", "captured_at": "..."}}}
}
历史追加到 data/prices/history.jsonl（每行一条快照，便于后续做走势图）。
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "prices.json"
PUBLIC = ROOT / "public" / "data" / "prices.json"
PHONES = ROOT / "data" / "phones.json"
HISTORY = ROOT / "data" / "prices" / "history.jsonl"

PLATFORM_KEYS = ("jd", "tmall", "pdd")
DEFAULT_PLATFORMS = {
    "jd": {"name": "京东", "search_url": "https://search.jd.com/Search?keyword={q}"},
    "tmall": {"name": "天猫", "search_url": "https://list.tmall.com/search_product.htm?q={q}"},
    "pdd": {"name": "拼多多", "search_url": "https://mobile.yangkeduo.com/search_result.html?search_key={q}"},
}


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def load_prices() -> dict:
    if not DATA.exists():
        return {"updated_at": None, "platforms": dict(DEFAULT_PLATFORMS), "items": {}}
    with DATA.open("r", encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("platforms", dict(DEFAULT_PLATFORMS))
    data.setdefault("items", {})
    return data


def save_prices(data: dict):
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def phone_ids() -> set[str]:
    with PHONES.open("r", encoding="utf-8") as f:
        phones = json.load(f)
    return {str(p.get("id")) for p in phones if p.get("id") is not None}


def append_history(item: dict):
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    with HISTORY.open("a", encoding="utf-8") as f:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")


def sync_public():
    if PUBLIC.parent.exists() or True:
        PUBLIC.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(DATA, PUBLIC)
    print(f"已同步: {PUBLIC}")


def cmd_set(args):
    ids = phone_ids()
    if str(args.id) not in ids:
        print(f"❌ 机型 id={args.id} 不存在于 data/phones.json", file=sys.stderr)
        return 1
    if args.platform not in PLATFORM_KEYS:
        print(f"❌ 平台必须是 {', '.join(PLATFORM_KEYS)}", file=sys.stderr)
        return 1
    if args.price <= 0:
        print("❌ 价格必须大于 0", file=sys.stderr)
        return 1
    data = load_prices()
    captured = args.captured_at or now_iso()
    entry = {
        "price": round(float(args.price), 2),
        "shop": args.shop or "",
        "url": args.url or "",
        "captured_at": captured,
        "note": args.note or "",
    }
    if args.list_price:
        entry["list_price"] = round(float(args.list_price), 2)
    if args.source_url:
        entry["source_url"] = args.source_url
    data["items"].setdefault(str(args.id), {})[args.platform] = entry
    data["updated_at"] = captured
    save_prices(data)
    append_history({"phone_id": args.id, "platform": args.platform, **entry})
    sync_public()
    print(f"✅ 已记录 id={args.id} {args.platform} ¥{entry['price']}（{captured}）")
    return 0


def cmd_import(args):
    path = Path(args.file)
    if not path.exists():
        print(f"❌ 文件不存在: {path}", file=sys.stderr)
        return 1
    ids = phone_ids()
    data = load_prices()
    count = 0
    errors = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = {"phone_id", "platform", "price"}
        if not required.issubset({(h or "").strip() for h in (reader.fieldnames or [])}):
            print(f"❌ CSV 需要表头: {', '.join(sorted(required))}（可选: shop,url,note,list_price,source_url,captured_at）", file=sys.stderr)
            return 1
        for lineno, row in enumerate(reader, start=2):
            row = {(k or "").strip(): (v or "").strip() for k, v in row.items()}
            pid = row.get("phone_id", "")
            platform = row.get("platform", "")
            try:
                price = float(row.get("price", ""))
            except ValueError:
                errors.append(f"第 {lineno} 行价格不合法: {row.get('price')!r}")
                continue
            if pid not in ids:
                errors.append(f"第 {lineno} 行 id 不存在: {pid}")
                continue
            if platform not in PLATFORM_KEYS:
                errors.append(f"第 {lineno} 行平台不合法: {platform}")
                continue
            if price <= 0:
                errors.append(f"第 {lineno} 行价格必须大于 0")
                continue
            captured = row.get("captured_at") or now_iso()
            entry = {
                "price": round(price, 2),
                "shop": row.get("shop", ""),
                "url": row.get("url", ""),
                "captured_at": captured,
                "note": row.get("note", ""),
            }
            if row.get("list_price"):
                try:
                    entry["list_price"] = round(float(row["list_price"]), 2)
                except ValueError:
                    pass
            if row.get("source_url"):
                entry["source_url"] = row["source_url"]
            data["items"].setdefault(pid, {})[platform] = entry
            data["updated_at"] = captured
            append_history({"phone_id": int(pid) if pid.isdigit() else pid, "platform": platform, **entry})
            count += 1
    save_prices(data)
    sync_public()
    print(f"✅ 导入 {count} 条")
    for e in errors[:10]:
        print(f"⚠️ {e}", file=sys.stderr)
    return 1 if errors else 0


def cmd_remove(args):
    data = load_prices()
    bucket = data["items"].get(str(args.id), {})
    if args.platform in bucket:
        del bucket[args.platform]
        if not bucket:
            del data["items"][str(args.id)]
        data["updated_at"] = now_iso()
        save_prices(data)
        sync_public()
        print(f"✅ 已删除 id={args.id} {args.platform}")
        return 0
    print("⚠️ 没有这条记录", file=sys.stderr)
    return 1


def validate_data(data: dict) -> list[str]:
    ids = phone_ids()
    errors = []
    for pid, platforms in data.get("items", {}).items():
        if pid not in ids:
            errors.append(f"phone_id {pid} 不存在于 phones.json")
        for key, entry in platforms.items():
            if key not in PLATFORM_KEYS:
                errors.append(f"id={pid} 平台未知: {key}")
            price = entry.get("price")
            if not isinstance(price, (int, float)) or price <= 0:
                errors.append(f"id={pid}/{key} 价格不合法: {price!r}")
            if not entry.get("captured_at"):
                errors.append(f"id={pid}/{key} 缺少 captured_at")
    return errors


def cmd_validate(_args):
    data = load_prices()
    errors = validate_data(data)
    items = sum(len(v) for v in data.get("items", {}).values())
    print(f"机型 {len(data.get('items', {}))} 台 / 价格记录 {items} 条 / 更新于 {data.get('updated_at') or '—'}")
    if errors:
        for e in errors[:20]:
            print(f"❌ {e}", file=sys.stderr)
        return 1
    print("✅ 校验通过")
    return 0


def cmd_report(_args):
    data = load_prices()
    items = data.get("items", {})
    total = sum(len(v) for v in items.values())
    stale_days = 30
    cutoff = datetime.now().astimezone() - timedelta(days=stale_days)
    stale = 0
    for platforms in items.values():
        for entry in platforms.values():
            try:
                ts = datetime.fromisoformat(entry.get("captured_at", ""))
            except ValueError:
                stale += 1
                continue
            if ts < cutoff:
                stale += 1
    print(f"覆盖机型 {len(items)} 台，价格记录 {total} 条，超过 {stale_days} 天未更新 {stale} 条")
    print("提示：可运行 fetch（需联盟 API）或 set/import 人工补录。")


def cmd_fetch(_args):
    keys = {k: os.environ.get(k) for k in ("JD_UNION_APP_KEY", "JD_UNION_APP_SECRET", "TBK_APP_KEY", "PDD_CLIENT_ID")}
    if not any(keys.values()):
        print("ℹ️ 未配置联盟 API 密钥（JD_UNION_APP_KEY / JD_UNION_APP_SECRET / TBK_APP_KEY / PDD_CLIENT_ID）。")
        print("   当前请用人工方式：python3 scripts/prices.py set ... 或 import --file prices.csv")
        print("   接入官方联盟 API 后可在此实现自动抓取（不建议爬虫抓电商页面）。")
        return 2
    print("ℹ️ 检测到部分密钥，但自动采集适配器尚未实现（下一步接入京东联盟/淘宝联盟/多多进宝）。")
    return 2


def build_parser():
    parser = argparse.ArgumentParser(description="电商参考价数据工具")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("set", help="写入一条人工采集价格")
    p.add_argument("--id", required=True)
    p.add_argument("--platform", required=True, choices=PLATFORM_KEYS)
    p.add_argument("--price", required=True, type=float)
    p.add_argument("--list-price", type=float)
    p.add_argument("--shop", default="")
    p.add_argument("--url", default="")
    p.add_argument("--note", default="")
    p.add_argument("--source-url", default="")
    p.add_argument("--captured-at", default="")
    p.set_defaults(func=cmd_set)

    p = sub.add_parser("import", help="从 CSV 批量导入")
    p.add_argument("--file", required=True)
    p.set_defaults(func=cmd_import)

    p = sub.add_parser("remove", help="删除一条价格")
    p.add_argument("--id", required=True)
    p.add_argument("--platform", required=True, choices=PLATFORM_KEYS)
    p.set_defaults(func=cmd_remove)

    p = sub.add_parser("validate", help="校验价格数据")
    p.set_defaults(func=cmd_validate)

    p = sub.add_parser("report", help="覆盖率/过期报告")
    p.set_defaults(func=cmd_report)

    p = sub.add_parser("sync", help="同步到 public/data/prices.json")
    p.set_defaults(func=lambda _a: (sync_public(), 0)[1])

    p = sub.add_parser("fetch", help="预留：联盟 API 自动采集")
    p.set_defaults(func=cmd_fetch)
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
