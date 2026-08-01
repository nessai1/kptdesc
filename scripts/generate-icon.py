"""Generate the app icon: terracotta squircle with a cream checkmark (the diary's checked box)."""
import math, struct, zlib

SIZE = 1024
BG = (0xC1, 0x61, 0x3C)       # accent terracotta
FG = (0xFF, 0xF8, 0xF0)       # cream on accent


def sd_round_rect(px, py, hw, hh, r):
    qx = abs(px) - hw + r
    qy = abs(py) - hh + r
    return math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - r


def sd_segment(px, py, ax, ay, bx, by):
    vx, vy = px - ax, py - ay
    wx, wy = bx - ax, by - ay
    t = 0.0
    denom = wx * wx + wy * wy
    if denom > 0:
        t = max(0.0, min(1.0, (vx * wx + vy * wy) / denom))
    return math.hypot(vx - t * wx, vy - t * wy)


def coverage(d):
    """Analytic antialiasing: alpha from the signed distance, one pixel wide."""
    return max(0.0, min(1.0, 0.5 - d))


# checkmark path from the design's SVG (viewBox 24): M4.5 12.5 l5 5 L19.5 6.5, stroke 3.4
SCALE = SIZE * 0.9 / 24.0
OFF = SIZE / 2.0 - 12.0 * SCALE
A = (4.5 * SCALE + OFF, 12.5 * SCALE + OFF)
B = (9.5 * SCALE + OFF, 17.5 * SCALE + OFF)
C = (19.5 * SCALE + OFF, 6.5 * SCALE + OFF)
HALF_STROKE = 3.4 * SCALE / 2.0

half = SIZE / 2.0
radius = SIZE * 0.225

rows = []
for y in range(SIZE):
    row = bytearray([0])
    py = y + 0.5
    for x in range(SIZE):
        px = x + 0.5
        bg_a = coverage(sd_round_rect(px - half, py - half, half, half, radius))
        mark = min(
            sd_segment(px, py, A[0], A[1], B[0], B[1]),
            sd_segment(px, py, B[0], B[1], C[0], C[1]),
        ) - HALF_STROKE
        fg_a = coverage(mark) * bg_a
        r = BG[0] + (FG[0] - BG[0]) * fg_a
        g = BG[1] + (FG[1] - BG[1]) * fg_a
        b = BG[2] + (FG[2] - BG[2]) * fg_a
        row += bytes((int(r + 0.5), int(g + 0.5), int(b + 0.5), int(bg_a * 255 + 0.5)))
    rows.append(bytes(row))

raw = b"".join(rows)


def chunk(tag, data):
    body = tag + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))


png = (
    b"\x89PNG\r\n\x1a\n"
    + chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0))
    + chunk(b"IDAT", zlib.compress(raw, 9))
    + chunk(b"IEND", b"")
)

with open("app-icon.png", "wb") as f:
    f.write(png)
print("written app-icon.png", len(png), "bytes")
