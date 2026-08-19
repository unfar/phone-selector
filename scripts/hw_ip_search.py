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

def extract_ip(text):
    hits = set()
    for m in re.finditer(r'IP\s*(\d\d|6X|X\d)(?:\s*/\s*IP\s*(\d\d|6X|X\d))?', text):
        a,b = m.group(1), m.group(2)
        if a and b:
            hits.add(f"IP{a}/IP{b}")
        elif a:
            hits.add(f"IP{a}")
    return hits

def get_em_text(html):
    # extract em highlighed + surrounding text
    out = re.findall(r'<em>([^<]+)</em>', html)
    return out

if __name__ == "__main__":
    q = sys.argv[1]
    html = search(q)
    print("LEN:", len(html))
    print("TITLE:", re.search(r'<title>(.*?)</title>', html, re.S))
    ems = get_em_text(html)
    print("EM:", ems[:60])
    print("IP HITS:", extract_ip(html))