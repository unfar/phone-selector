#!/usr/bin/env python3
"""
🔄 phone-selector 数据自动修复系统
根据标签→硬件字段映射，自动补全和矫正数据
"""

import json

# ===== 标签 ↔ 硬件字段映射规则 =====
TAG_RULES = [
    # (标签名, 检查字段, 检查条件, 是否自动修复)
    ('无线充电', 'wireless_charging_w', lambda v: v and v > 0, True),
    ('6500mAh+', 'battery_mah', lambda v: v and v >= 6500, True),
    ('≤200g', 'weight_g', lambda v: v and 0 < v <= 200, True),
    ('USB3.0', 'usb_version', lambda v: str(v or '').startswith('USB 3') or 'USB3' in str(v or ''), True),
]

# ===== features → 标签映射 =====
FEATURE_TAG_MAP = {
    'NFC': 'NFC',
    '红外': '红外',
    '防水': '防水',
}

# ===== features 关键词 → 防水标签 =====
WATER_PROOF_KEYWORDS = ['ip68', 'ip69', 'ip66', '抗水', '防水']

def auto_fix():
    with open('data/phones.json', 'r') as f:
        phones = json.load(f)
    
    auto_fixes = []
    manual_report = []
    
    for p in phones:
        pid = p['id']
        model = p.get('model', '?')
        brand = p.get('brand', '?')
        tags = list(p.get('tags') or [])
        feats = [str(f) for f in (p.get('features') or [])]
        changed = False
        
        # === 1. 硬件字段 → 标签（自动修复）===
        for tag_name, field, check, auto in TAG_RULES:
            val = p.get(field)
            if check(val) and tag_name not in tags:
                tags.append(tag_name)
                changed = True
                if auto:
                    auto_fixes.append(f"[自动] ID {pid} {brand} {model}: 补「{tag_name}」标签")
        
        # === 2. features → 标签 ===
        for feat_keyword, tag_name in FEATURE_TAG_MAP.items():
            has_in_feats = any(feat_keyword in f for f in feats)
            if has_in_feats and tag_name not in tags:
                tags.append(tag_name)
                changed = True
                auto_fixes.append(f"[自动] ID {pid} {brand} {model}: features含{feat_keyword}→补「{tag_name}」标签")
        
        # === 3. features中的防水关键词 → 防水标签 ===
        has_waterproof_feat = any(kw in ' '.join(feats).lower() for kw in WATER_PROOF_KEYWORDS)
        if has_waterproof_feat and '防水' not in tags:
            tags.append('防水')
            changed = True
            auto_fixes.append(f"[自动] ID {pid} {brand} {model}: features含防水关键词→补「防水」标签")
        
        # === 4. 反向检查：有标签但字段不对应 ===
        for tag_name, field, check, _ in TAG_RULES:
            val = p.get(field)
            if tag_name in tags and not check(val):
                manual_report.append(f"[人工] ID {pid} {brand} {model}: 有「{tag_name}」标签但{field}={val}，请确认")
        
        if changed:
            p['tags'] = tags
    
    # === 5. 保存 ===
    with open('data/phones.json', 'w', encoding='utf-8') as f:
        json.dump(phones, f, ensure_ascii=False, indent=2)
    
    # === 输出报告 ===
    print(f"\n{'='*50}")
    print(f"🔄 自动修复报告")
    print(f"{'='*50}\n")
    
    if auto_fixes:
        print(f"✅ 自动修复 ({len(auto_fixes)} 项)：\n")
        for f in auto_fixes:
            print(f"  {f}")
    else:
        print("✅ 自动修复: 0 项（全部已正确）\n")
    
    if manual_report:
        print(f"\n⚠️ 需人工确认 ({len(manual_report)} 项)：\n")
        for f in manual_report:
            print(f"  {f}")
    else:
        print(f"⚠️ 需人工确认: 0 项 ✅")
    
    print(f"\n{'='*50}")
    return len(auto_fixes), len(manual_report)

if __name__ == '__main__':
    auto_fix()
