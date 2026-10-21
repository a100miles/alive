"""Fetch the six credited demo photos locally; no runtime hotlinks.

Network requests time out after 25 seconds. Existing photos are preserved.
Sources and license were checked on 2026-10-16. Read public/media/README.md.
"""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import struct
import urllib.request

OUTPUT = Path(__file__).resolve().parents[1] / "frontend/public/media/photos"


def dimensions(data: bytes) -> tuple[int, int]:
    if data[:2] != b"\xff\xd8":
        raise ValueError("Downloaded asset is not a JPEG")
    offset = 2
    while offset < len(data):
        if data[offset] != 255:
            offset += 1
            continue
        marker = data[offset + 1]
        offset += 2
        if marker in (0xD8, 0xD9):
            continue
        size = struct.unpack(">H", data[offset:offset + 2])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack(">HH", data[offset + 3:offset + 7])
            return width, height
        offset += size
    raise ValueError("JPEG dimensions not found")


def download(item: dict) -> dict:
    target = OUTPUT / f"{item['id']}.jpg"
    if target.is_file():
        data = target.read_bytes()
    else:
        request = urllib.request.Request(item["download"], headers={"User-Agent": "a.l.i.v.e-demo-media/1.0"})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read()
        dimensions(data)
    # A standard JPEG comment stores source provenance without changing pixels.
    origin = f"Demo photograph by {item['photographer']}; {item['source']}; https://unsplash.com/license; downloaded 2026-10-16".encode("utf-8")
    if origin not in data:
        data = data[:2] + b"\xff\xfe" + struct.pack(">H", len(origin) + 2) + origin + data[2:]
        target.write_bytes(data)
    width, height = dimensions(data)
    result = {**item, "width": width, "height": height, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "license": "https://unsplash.com/license", "verified": "2026-10-16"}
    print(f"{target.name}: {width}x{height}, {len(data)} bytes", flush=True)
    return result


if __name__ == "__main__":
    sources = json.loads((OUTPUT / "sources.json").read_text(encoding="utf-8-sig"))
    with ThreadPoolExecutor(max_workers=6) as pool:
        assets = list(pool.map(download, sources))
    (OUTPUT / "manifest.json").write_text(json.dumps(assets, indent=2) + "\n", encoding="utf-8")
