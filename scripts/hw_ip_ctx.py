#!/usr/bin/env python3
import subprocess, re, urllib.parse, sys, json

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

def search(query):
    url = "https://www.so.com/s?q=" + urllib.parse.quote(query)
    try:
        r = subprocess.run(["curl","-s","-A",UA,"--max-time","25","--compressed",url],
                           capture_output=True, text=True, timeout=30)
        return r.stdout
    except Exception as e:
        return ""

def clean(t):
    t = re.sub(r'<[^>]+>', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    return t.strip()

def main():
    q = sys.argv[1]
    html = search(q)
    # find result blocks: text with IP context
    # Dump IP mentions with surrounding 120 chars
    body = clean(html)
    idx = 0
    found = set()
    # Find unique IP tokens
    for m in re.finditer(r'IP(?:68|69|X8|X5|X4|X7|6X|X9|67|66|5X)', body):
        s = max(0, m.start()-70); e=min(len(body), m.end()+70)
        found.add(body[s:e])
    print("IP CONTEXT SNIPPETS:")
    for s in sorted(found)[:15]:
        print("  •", s)
        print()

if __name__ == "__main__":
    main()