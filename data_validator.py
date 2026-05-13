#!/usr/bin/env python3
"""手机选购助手 — 数据质量校验脚本"""
import json, sys
from collections import Counter

with open('data/phones.json', 'r') as f:
    data = json.load(f)

print(f"\n{'='*50}")
print(f"📊 数据质量报告 — {len(data)} 款机型")
print(f"{'='*50}\n")

# ===== 1. 参数合理性检查 =====
print("🔴 参数异常值:")
warnings = []
for p in data:
    name = f"{p['brand']} {p.get('model','')}"
    batt = p.get('battery_mah', 0) or 0
    weight = p.get('weight_g', 0) or 0
    price = p.get('price', 0) or 0
    screen = p.get('screen_size', 0) or 0
    charging = p.get('charging_w', 0) or 0
    wc = p.get('wireless_charging_w', 0) or 0
    
    if 0 < batt < 2000: warnings.append(f"电池过小 {name}: {batt}mAh")
    if batt > 12000: warnings.append(f"电池过大 {name}: {batt}mAh")
    if 0 < weight < 80: warnings.append(f"重量过轻 {name}: {weight}g")
    if weight > 400: warnings.append(f"重量过重 {name}: {weight}g")
    if 0 < price < 300: warnings.append(f"价格过低 {name}: ¥{price}")
    if price > 50000: warnings.append(f"价格过高 {name}: ¥{price}")
    if 0 < screen < 3: warnings.append(f"屏幕过小 {name}: {screen}英寸")
    if screen > 10: warnings.append(f"屏幕过大 {name}: {screen}英寸")
    if 0 < charging < 5: warnings.append(f"充电过低 {name}: {charging}W")
    if charging > 300: warnings.append(f"充电过高 {name}: {charging}W")
    if wc > charging and charging > 0: warnings.append(f"无线充>有线充 {name}: {wc}W>{charging}W")

if warnings:
    for w in warnings:
        print(f"  ⚠️  {w}")
else:
    print("  ✅ 无异常")
print()

# ===== 2. 缺失字段统计 =====
print("🟡 数据完整度:")
fields = ['price','release_date','ram','storage','battery_mah','charging_w',
          'wireless_charging_w','weight_g','screen_size','screen_form',
          'usb_version','camera_desc','os']
for f in fields:
    missing = sum(1 for p in data if p.get(f) is None or p.get(f) == '' or p.get(f) == 0)
    pct = missing/len(data)*100
    bar = '█' * int((100-pct)/5) + '░' * int(pct/5)
    if missing > 0:
        print(f"  {f:20s} {bar} {100-pct:.0f}%（{len(data)-missing}/{len(data)}）")
print()

# ===== 3. 标签准确性 =====
print("🟢 标签准确性:")
bat_ok = sum(1 for p in data if ('6500mAh+' in p.get('tags',[])) == ((p.get('battery_mah',0) or 0) >= 6500))
wt_ok = sum(1 for p in data if ('≤200g' in p.get('tags',[])) == (0 < (p.get('weight_g',0) or 0) <= 200))
print(f"  6500mAh+ 标签: {bat_ok}/{len(data)} 准确 ({bat_ok/len(data)*100:.0f}%)")
print(f"  ≤200g 标签:    {wt_ok}/{len(data)} 准确 ({wt_ok/len(data)*100:.0f}%)")
print()

# ===== 4. 品牌统计 =====
print("🔵 品牌分布:")
brands = Counter(p['brand'] for p in data)
for b, c in brands.most_common():
    bar = '█' * c
    print(f"  {b:8s} {bar} {c}款")
print()

# ===== 5. 处理器命名规范 =====
print("🟣 处理器命名检查:")
known_processors = [
    # 骁龙8系旗舰
    '骁龙8 Elite 5','骁龙8 Elite 1','骁龙8 Elite 5 (for Galaxy)','骁龙8 Elite 1 (for Galaxy)',
    '骁龙8 Gen5','骁龙8 Gen4','骁龙8 Gen 3','骁龙8 Gen 2',
    '骁龙8s Gen4','骁龙8s Gen3','骁龙8S Gen3',
    # 骁龙7系中端
    '骁龙7s Gen4','骁龙7s Gen3','骁龙7s Gen2',
    '骁龙7+ Gen3','骁龙7 Gen4','骁龙7 Gen3','骁龙7 Gen1',
    '骁龙778G',
    # 骁龙6系入门
    '骁龙6 Gen4','骁龙6 Gen3','骁龙6 Gen1',
    '骁龙4 Gen2','骁龙680',
    # 天玑旗舰
    '天玑9500','天玑9500s','天玑9400','天玑9400+','天玑9400e',
    '天玑9300','天玑9200','天玑9200+',
    # 天玑中端
    '天玑8500 Elite','天玑8500 SUPER',
    '天玑8450','天玑8400','天玑8350','天玑8300',
    '天玑8250','天玑8200',
    '天玑7400','天玑7350','天玑7300','天玑7300+','天玑7300e',
    '天玑7050','天玑7025',
    '天玑6400 Max','天玑6360 MAX','天玑6300','天玑6080',
    # 麒麟
    '麒麟9030','麒麟9030 Pro','麒麟9030 Pro/麒麟9030','麒麟9030S',
    '麒麟9100','麒麟9020','麒麟9010S','麒麟9010','麒麟9010s',
    '麒麟9000S','麒麟8020','麒麟8000',
    '麒麟710A','麒麟7010',
    # 苹果
    'A19','A19 Pro','A18','A18 Pro',
    # 三星Exynos
    'Exynos 2400','Exynos 2200','Exynos 1580','Exynos 1480',
    # 谷歌
    'Google Tensor G4',
    # 联发科Helio
    '联发科Helio G81',
]
procs = set()
for p in data:
    proc = p.get('processor','')
    if proc:
        procs.add(proc)
for p in sorted(procs):
    if p not in known_processors:
        count = sum(1 for x in data if x.get('processor') == p)
        print(f"  ⚠️ 未知处理器: {p}（{count}款）")
print()

print(f"{'='*50}")
print("✅ 校验完成")
print(f"{'='*50}")
