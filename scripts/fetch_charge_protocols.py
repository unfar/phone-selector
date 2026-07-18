#!/usr/bin/env python3
"""从 /tmp/cdt/body 已抓取的充电头网文章中提取 charge_protocols 并写入 phones.json。
先按 phone-selector skill 的 chongdiantou 流程抓标签页与正文到 /tmp/cdt/body。
"""
import json, re, html
from pathlib import Path
from collections import defaultdict

ROOT = Path('/Users/greg/Downloads/Projects/phone-select-dev/phone-select')
phones = json.loads((ROOT / 'data/phones.json').read_text(encoding='utf-8'))
body_dir = Path('/tmp/cdt/body')

PROTO_CANON = [
    ('5A PPS', ['5A PPS', '5A-PPS', '5APPS']),
    ('UFCS', ['UFCS', '融合快充']),
    ('PPS', ['PPS']),
    ('PD3.0', ['PD3.0', 'PD 3.0', 'USB PD3.0']),
    ('PD', ['USB PD', 'PD快充', 'PD协议', '支持PD']),
    ('QC', ['QC3', 'QC 3', 'QC2', 'Quick Charge', 'QC快充', '支持QC']),
    ('SCP', ['SCP', '超级快充协议']),
    ('FCP', ['FCP']),
    ('VFCP', ['VFCP', 'FlashCharge']),
    ('Qi2', ['Qi2', 'QI2']),
    ('Qi', ['Qi认证', 'Qi 认证', 'Qi无线', '支持Qi', 'Qi 无线']),
]


def norm(s: str) -> str:
    s = str(s).lower()
    for a, b in [
        ('huawei', '华为'), ('honor', '荣耀'), ('xiaomi', '小米'), ('redmi', '红米'),
        ('oneplus', '一加'), ('samsung', '三星'), ('galaxy', ''),
    ]:
        s = s.replace(a, b)
    return re.sub(r'[\s\-_/·|()+（）]+', '', s)


phone_keys = []
for p in phones:
    model = p.get('model', '')
    variants = {
        model,
        re.sub(r'^(华为|荣耀|小米|红米|真我|一加|三星|HUAWEI|HONOR|OPPO|vivo|iQOO|Xiaomi|Redmi|Galaxy)\s*', '', model, flags=re.I),
        model.replace('HUAWEI ', '').replace('HONOR ', '').replace('OPPO ', '').replace('vivo ', '')
            .replace('iQOO ', '').replace('Xiaomi ', '').replace('Redmi ', '').replace('Galaxy ', ''),
    }
    nkeys = sorted({norm(v) for v in variants if len(norm(v)) >= 4}, key=len, reverse=True)
    phone_keys.append((p, nkeys))


def extract_protocols(text: str):
    found = set()
    for canon, alts in PROTO_CANON:
        if any(alt in text for alt in alts):
            found.add(canon)
    out = [c for c, _ in PROTO_CANON if c in found]
    if 'PD3.0' in out:
        out = [x for x in out if x != 'PD']
    if 'Qi2' in out:
        out = [x for x in out if x != 'Qi']
    if '5A PPS' in out and 'PPS' not in out:
        out.insert(out.index('5A PPS') + 1, 'PPS')
    return out


def extract_title(raw: str) -> str:
    m = re.search(r'<title>(.*?)</title>', raw, re.I | re.S)
    if not m:
        return ''
    return html.unescape(re.sub(r'\s+', ' ', m.group(1))).replace(' - 充电头网 - 我们只谈充电', '').strip()


def strip_tags(s: str) -> str:
    s = re.sub(r'<script[\s\S]*?</script>', ' ', s, flags=re.I)
    s = re.sub(r'<style[\s\S]*?</style>', ' ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return html.unescape(re.sub(r'\s+', ' ', s))


articles = []
for f in body_dir.glob('*.html'):
    raw = f.read_text(encoding='utf-8', errors='ignore')
    if len(raw) < 3000:
        continue
    title = extract_title(raw)
    text = strip_tags(raw)
    blob = title + ' ' + text
    if not any(k in blob for k in ['手机', '充电评测', '快充', '无线充', 'Pura', 'Mate', 'Find', 'Magic', 'iPhone', '小米', '荣耀', '一加', 'vivo', 'OPPO', '华为', 'iQOO', 'Galaxy']):
        continue
    protos = extract_protocols(blob)
    if not protos:
        continue
    articles.append({
        'file': f.name,
        'title': title,
        'text': text,
        'protocols': protos,
        'is_summary': any(k in title for k in ['汇总', '盘点', '简史', '回顾', '一览']),
    })

print('articles', len(articles), 'summary', sum(1 for a in articles if a['is_summary']))

updates = defaultdict(lambda: {'protocols': set(), 'titles': []})
for art in articles:
    tnorm = norm(art['title'] + ' ' + art['text'][:1200])
    matched = []
    for p, nkeys in phone_keys:
        for k in nkeys:
            if k in tnorm:
                matched.append((len(k), p['id'], p['model'], k))
                break
    matched.sort(reverse=True)
    seen = set()
    kept = []
    limit = 30 if art['is_summary'] else 4
    for ln, pid, model, k in matched:
        if pid in seen:
            continue
        if ln < 5:
            continue
        seen.add(pid)
        kept.append((ln, pid, model, k))
        if len(kept) >= limit:
            break
    for ln, pid, model, k in kept:
        updates[pid]['protocols'].update(art['protocols'])
        updates[pid]['titles'].append(art['title'][:70])

print('matched phones', len(updates))
for pid, info in list(sorted(updates.items(), key=lambda x: -len(x[1]['protocols'])))[:20]:
    model = next(p['model'] for p in phones if p['id'] == pid)
    print(pid, model, sorted(info['protocols']), '|', info['titles'][0])

order = [c for c, _ in PROTO_CANON]
filled = merged = 0
for p in phones:
    info = updates.get(p['id'])
    if not info:
        continue
    new = [c for c in order if c in info['protocols']]
    if not new:
        continue
    old = p.get('charge_protocols') or []
    if not old:
        p['charge_protocols'] = new
        p['charge_protocols_source'] = 'chongdiantou'
        filled += 1
    else:
        m = [c for c in order if c in set(old) | set(new)]
        if m != list(old):
            p['charge_protocols'] = m
            merged += 1

(ROOT / 'data/phones.json').write_text(json.dumps(phones, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(ROOT / 'public/data/phones.json').write_text(json.dumps(phones, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('filled', filled, 'merged', merged, 'total', sum(1 for p in phones if p.get('charge_protocols')))
print('identical', json.loads((ROOT/'data/phones.json').read_text()) == json.loads((ROOT/'public/data/phones.json').read_text()))
newbies = [p for p in phones if p.get('charge_protocols_source') == 'chongdiantou']
print('newbies', len(newbies))
for p in sorted(newbies, key=lambda x: -(x.get('price') or 0))[:40]:
    print(f"{p['id']:>4} {p['model'][:30]:30} {p['charge_protocols']}")
