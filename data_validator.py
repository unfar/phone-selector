#!/usr/bin/env python3
"""
📋 phone-selector 数据质量校验器
自动检查数据完整性和逻辑一致性
"""

import json, sys
from datetime import datetime

def validate():
    with open('data/phones.json', 'r') as f:
        phones = json.load(f)
    
    errors = []
    warnings = []
    
    for p in phones:
        pid = p['id']
        model = p.get('model', '?')
        brand = p.get('brand', '?')
        
        # === 1. 必填字段检查 ===
        if not p.get('price') or p['price'] == 0:
            errors.append(f"[缺失] ID {pid} {brand} {model}: 价格为空")
        if not p.get('battery_mah') or p['battery_mah'] == 0:
            errors.append(f"[缺失] ID {pid} {brand} {model}: 电池为空")
        if not p.get('weight_g') or p['weight_g'] == 0:
            errors.append(f"[缺失] ID {pid} {brand} {model}: 重量为空")
        
        # === 2. 标签一致性检查 ===
        tags = p.get('tags') or []
        features = [str(f) for f in (p.get('features') or [])]
        ww = p.get('wireless_charging_w')
        usb = str(p.get('usb_version', '') or '')
        bat = p.get('battery_mah') or 0
        wt = p.get('weight_g') or 0
        ht = p.get('has_tele')
        
        checks = [
            ('无线充电', ww and ww > 0, '无线充电'),
            ('USB3.0', 'USB 3' in usb or 'USB3' in usb, 'USB3.0'),
            ('潜望长焦', ht, '潜望长焦'),
            ('6500mAh+', bat >= 6500, '6500mAh+'),
            ('≤200g', 0 < wt <= 200, '≤200g'),
        ]
        
        for name, condition, tag in checks:
            if condition and tag not in tags:
                warnings.append(f"[标签] ID {pid} {brand} {model}: 有{name}但缺「{tag}」标签")
        
        # 防水检查
        has_ip = any('ip68' in f.lower() or 'ip69' in f.lower() for f in features)
        if has_ip and '防水' not in tags:
            warnings.append(f"[标签] ID {pid} {brand} {model}: features有IP68/IP69但缺「防水」标签")
        
        # NFC/红外检查
        has_nfc = any('nfc' in f.lower() for f in features)
        if has_nfc and 'NFC' not in tags:
            warnings.append(f"[标签] ID {pid} {brand} {model}: features有NFC但缺「NFC」标签")
        
        has_ir = any('红外' in f for f in features)
        if has_ir and '红外' not in tags:
            warnings.append(f"[标签] ID {pid} {brand} {model}: features有红外但缺「红外」标签")
        
        # === 3. 价格异常检查 ===
        price = p.get('price') or 0
        if 0 < price < 300:
            warnings.append(f"[异常] ID {pid} {brand} {model}: 价格¥{price}偏低")
        if price > 30000:
            warnings.append(f"[异常] ID {pid} {brand} {model}: 价格¥{price}偏高")
        
        # === 4. 处理器标签检查 ===
        cpu = str(p.get('processor', '') or '')
        cpu_tags = [t for t in tags if any(k in t for k in ['骁龙', '天玑', '麒麟', 'Elite', 'Gen', 'A'])]
        if cpu and not cpu_tags:
            warnings.append(f"[标签] ID {pid} {brand} {model}: 处理器「{cpu}」但无对应CPU标签")
    
    # === 5. 重复检查 ===
    seen = {}
    for p in phones:
        key = (p['brand'], p['model'])
        if key in seen:
            warnings.append(f"[重复] {p['brand']} {p['model']} (ID {seen[key]} 和 ID {p['id']})")
        seen[key] = p['id']
    
    # === 输出报告 ===
    print(f"\n{'='*50}")
    print(f"📋 数据质量校验报告")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"📊 共 {len(phones)} 款机型")
    print(f"{'='*50}\n")
    
    if errors:
        print(f"🔴 错误 ({len(errors)} 项) - 必须修复：\n")
        for e in errors:
            print(f"  {e}")
    else:
        print("🔴 错误: 0 项 ✅\n")
    
    if warnings:
        print(f"🟡 警告 ({len(warnings)} 项) - 建议修复：\n")
        for w in warnings:
            print(f"  {w}")
    else:
        print("🟡 警告: 0 项 ✅\n")
    
    print(f"{'='*50}")
    
    return len(errors), len(warnings)

if __name__ == '__main__':
    err, warn = validate()
    sys.exit(1 if err > 0 else 0)
