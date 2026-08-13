#!/usr/bin/env python3
"""phone-select CLI — 手机参数查询工具

用法:
  python cli.py search "K100"              # 按关键词搜索
  python cli.py brand HONOR                # 按品牌筛选
  python cli.py price 3000 5000            # 按价格区间筛选
  python cli.py cpu "骁龙8 Elite 5"        # 按处理器筛选
  python cli.py screen 6.5 6.7             # 按屏幕尺寸区间筛选
  python cli.py detail 270                # 按 ID 查看详情
  python cli.py list                      # 列出所有机型
  python cli.py compare 268 269           # 对比多款机型
"""

import json, sys, os, argparse
from pathlib import Path

# 自动查找 phones.json
def load_data():
    # 优先环境变量
    env_path = os.environ.get("PHONE_SELECT_DATA")
    if env_path and Path(env_path).exists():
        return json.loads(Path(env_path).read_text(encoding="utf-8"))
    # 相对于脚本所在目录
    script_dir = Path(__file__).parent
    for candidate in [
        script_dir / "data" / "phones.json",
        script_dir / "phones.json",
        script_dir / "public" / "phones.json",
        script_dir / "dist" / "phones.json",
    ]:
        if candidate.exists():
            return json.loads(candidate.read_text(encoding="utf-8"))
    print("❌ 找不到 phones.json，请设置环境变量 PHONE_SELECT_DATA 指向数据文件路径")
    sys.exit(1)

def fmt_phone(row, brief=True):
    """格式化输出一条手机信息"""
    name = f"{row.get('brand','')} {row.get('model','')}"
    price = f"¥{row['price']}" if row.get("price") else "—"
    cpu = row.get("processor", "—")
    screen = f"{row.get('screen_size','—')}\""
    battery = f"{row.get('battery_mah','—')}mAh" if row.get("battery_mah") else "—"
    weight = f"{row.get('weight_g','—')}g" if row.get("weight_g") else "—"
    release = row.get("release_date", "—")

    if brief:
        return f"[{row['id']}] {name}  {price}  {cpu}  {screen} {battery}  {weight}  {release}"
    else:
        lines = [f"━━━ [{row['id']}] {name} ━━━"]
        lines.append(f"  价格:      {price}  {row.get('price_note','') or ''}")
        lines.append(f"  发布日期:  {release}")
        lines.append(f"  处理器:    {cpu}")
        lines.append(f"  内存/存储: {row.get('ram','—')} / {row.get('storage','—')}")
        lines.append(f"  屏幕:      {row.get('screen_detail','—')}")
        lines.append(f"  分辨率:    {row.get('resolution','—')}")
        lines.append(f"  刷新率:    {row.get('refresh_hz','—')}Hz")
        lines.append(f"  电池:      {battery}")
        lines.append(f"  充电:      {row.get('charging_w','—')}W有线 / {row.get('wireless_charging_w','—')}W无线")
        lines.append(f"  主摄:      {row.get('camera_main_mp','—')}MP")
        lines.append(f"  前置:      {row.get('camera_front','—')}")
        lines.append(f"  后置:      {row.get('camera_rear','—')}")
        lines.append(f"  影像详情:  {row.get('detailed_camera','—')}")
        lines.append(f"  影像描述:  {row.get('camera_desc','—')}")
        lines.append(f"  厚度:      {row.get('thickness','—')}mm")
        lines.append(f"  重量:      {weight}")
        lines.append(f"  系统:      {row.get('os','—')}")
        lines.append(f"  USB:       {row.get('usb_version','—')}")
        lines.append(f"  WiFi:      {row.get('wifi','—')}")
        lines.append(f"  蓝牙:      {row.get('bluetooth','—')}")
        lines.append(f"  NFC:       {'✓' if row.get('nfc') else '✗'}")
        lines.append(f"  eSIM:      {'✓' if row.get('esim') else '✗'}")
        lines.append(f"  防护:      {[f for f in row.get('features',[]) if 'IP' in f] or '—'}")
        lines.append(f"  特性:      {', '.join(row.get('features',[]))}")
        lines.append(f"  标签:      {', '.join(row.get('tags',[]))}")
        lines.append(f"  入网型号:  {row.get('network_model','—')}")
        lines.append(f"  数据更新:  {row.get('verified_at','—')}")
        return "\n".join(lines)

def cmd_search(args):
    data = load_data()
    q = args.query.lower()
    results = []
    for row in data:
        name = f"{row.get('brand','')} {row.get('model','')}".lower()
        if q in name or q in str(row.get("processor","")).lower():
            results.append(row)
    if not results:
        print(f"未找到匹配 '{args.query}' 的机型")
        return
    print(f"找到 {len(results)} 款机型:\n")
    for row in results:
        print(fmt_phone(row))

def cmd_brand(args):
    data = load_data()
    brand = args.brand.upper()
    results = [r for r in data if r.get("brand","").upper() == brand]
    if not results:
        print(f"未找到品牌 {brand} 的机型")
        return
    print(f"{brand} 共 {len(results)} 款机型:\n")
    for row in results:
        print(fmt_phone(row))

def cmd_price(args):
    data = load_data()
    lo, hi = args.min, args.max
    results = [r for r in data if r.get("price") and lo <= r["price"] <= hi]
    if not results:
        print(f"未找到价格区间 ¥{lo}-¥{hi} 的机型")
        return
    results.sort(key=lambda r: r["price"])
    print(f"价格 ¥{lo}-¥{hi} 共 {len(results)} 款:\n")
    for row in results:
        print(fmt_phone(row))

def cmd_cpu(args):
    data = load_data()
    q = args.query.lower()
    results = [r for r in data if q in str(r.get("processor","")).lower()]
    if not results:
        print(f"未找到处理器含 '{args.query}' 的机型")
        return
    print(f"处理器含 '{args.query}' 共 {len(results)} 款:\n")
    for row in results:
        print(fmt_phone(row))

def cmd_screen(args):
    data = load_data()
    lo, hi = args.min, args.max
    results = [r for r in data if r.get("screen_size") and lo <= r["screen_size"] <= hi]
    if not results:
        print(f"未找到屏幕尺寸 {lo}\"-{hi}\" 的机型")
        return
    results.sort(key=lambda r: r["screen_size"])
    print(f"屏幕 {lo}\"-{hi}\" 共 {len(results)} 款:\n")
    for row in results:
        print(fmt_phone(row))

def cmd_detail(args):
    data = load_data()
    row = next((r for r in data if r["id"] == args.id), None)
    if not row:
        print(f"未找到 id={args.id} 的机型")
        return
    print(fmt_phone(row, brief=False))

def cmd_list(args):
    data = load_data()
    print(f"共 {len(data)} 款机型:\n")
    for row in sorted(data, key=lambda r: r["id"]):
        print(fmt_phone(row))

def cmd_compare(args):
    data = load_data()
    phones = []
    for pid in args.ids:
        row = next((r for r in data if r["id"] == pid), None)
        if row:
            phones.append(row)
        else:
            print(f"⚠️  未找到 id={pid}")
    if len(phones) < 2:
        print("对比至少需要 2 款机型")
        return

    # 对比关键字段
    fields = [
        ("价格", "price", lambda v: f"¥{v}" if v else "—"),
        ("处理器", "processor", lambda v: v or "—"),
        ("内存", "ram", lambda v: v or "—"),
        ("存储", "storage", lambda v: v or "—"),
        ("屏幕尺寸", "screen_size", lambda v: f"{v}\"" if v else "—"),
        ("分辨率", "resolution", lambda v: v or "—"),
        ("刷新率", "refresh_hz", lambda v: f"{v}Hz" if v else "—"),
        ("屏幕详情", "screen_detail", lambda v: v or "—"),
        ("电池", "battery_mah", lambda v: f"{v}mAh" if v else "—"),
        ("有线充电", "charging_w", lambda v: f"{v}W" if v else "—"),
        ("无线充电", "wireless_charging_w", lambda v: f"{v}W" if v else "—"),
        ("主摄", "camera_main_mp", lambda v: f"{v}MP" if v else "—"),
        ("前置", "camera_front", lambda v: v or "—"),
        ("后置", "camera_rear", lambda v: v or "—"),
        ("影像详情", "detailed_camera", lambda v: v or "—"),
        ("厚度", "thickness", lambda v: f"{v}mm" if v else "—"),
        ("重量", "weight_g", lambda v: f"{v}g" if v else "—"),
        ("系统", "os", lambda v: v or "—"),
        ("USB", "usb_version", lambda v: v or "—"),
        ("WiFi", "wifi", lambda v: v or "—"),
        ("蓝牙", "bluetooth", lambda v: v or "—"),
        ("NFC", "nfc", lambda v: "✓" if v else "✗"),
        ("eSIM", "esim", lambda v: "✓" if v else "✗"),
        ("入网型号", "network_model", lambda v: v or "—"),
    ]

    # 表头
    names = [f"{r['brand']} {r['model']}" for r in phones]
    max_name = max(len(n) for n in names)
    label_w = 14
    col_w = max(max_name, 20)

    header = f"{'参数':<{label_w}}" + "".join(f"{n:<{col_w}}" for n in names)
    print(header)
    print("─" * len(header))

    for label, key, fmt in fields:
        vals = [fmt(r.get(key)) for r in phones]
        # 标记差异
        all_same = len(set(vals)) == 1
        line = f"{label:<{label_w}}"
        for i, v in enumerate(vals):
            cell = v[:col_w-1]
            if not all_same and vals.count(v) == 1:
                cell = f"★{cell}"
            line += f"{cell:<{col_w}}"
        print(line)

    print()
    print("★ = 该机型独有的参数值")

def cmd_brands(args):
    data = load_data()
    from collections import Counter
    brands = Counter(r.get("brand","") for r in data)
    print(f"共 {len(brands)} 个品牌:\n")
    for brand, count in brands.most_common():
        print(f"  {brand:<16} {count} 款")

def main():
    parser = argparse.ArgumentParser(
        description="📱 phone-select CLI — 手机参数查询工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s search "K100"           按关键词搜索
  %(prog)s brand HONOR            按品牌筛选
  %(prog)s price 3000 5000        按价格区间筛选
  %(prog)s cpu "骁龙8 Elite 5"    按处理器筛选
  %(prog)s screen 6.5 6.7         按屏幕尺寸筛选
  %(prog)s detail 270             按 ID 查看详情
  %(prog)s list                   列出所有机型
  %(prog)s brands                 列出所有品牌
  %(prog)s compare 268 269 270    对比多款机型

环境变量:
  PHONE_SELECT_DATA               指向 phones.json 路径
        """
    )

    sub = parser.add_subparsers(dest="command", help="子命令")

    # search
    p_search = sub.add_parser("search", help="按关键词搜索机型")
    p_search.add_argument("query", help="搜索关键词")

    # brand
    p_brand = sub.add_parser("brand", help="按品牌筛选")
    p_brand.add_argument("brand", help="品牌名称 (如 HONOR, REDMI, vivo)")

    # price
    p_price = sub.add_parser("price", help="按价格区间筛选")
    p_price.add_argument("min", type=int, help="最低价格")
    p_price.add_argument("max", type=int, help="最高价格")

    # cpu
    p_cpu = sub.add_parser("cpu", help="按处理器筛选")
    p_cpu.add_argument("query", help="处理器关键词")

    # screen
    p_screen = sub.add_parser("screen", help="按屏幕尺寸区间筛选")
    p_screen.add_argument("min", type=float, help="最小尺寸")
    p_screen.add_argument("max", type=float, help="最大尺寸")

    # detail
    p_detail = sub.add_parser("detail", help="按 ID 查看详情")
    p_detail.add_argument("id", type=int, help="机型 ID")

    # list
    sub.add_parser("list", help="列出所有机型")

    # brands
    sub.add_parser("brands", help="列出所有品牌")

    # compare
    p_compare = sub.add_parser("compare", help="对比多款机型")
    p_compare.add_argument("ids", type=int, nargs="+", help="机型 ID 列表")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    commands = {
        "search": cmd_search,
        "brand": cmd_brand,
        "price": cmd_price,
        "cpu": cmd_cpu,
        "screen": cmd_screen,
        "detail": cmd_detail,
        "list": cmd_list,
        "brands": cmd_brands,
        "compare": cmd_compare,
    }

    cmd = commands.get(args.command)
    if cmd:
        cmd(args)

if __name__ == "__main__":
    main()
