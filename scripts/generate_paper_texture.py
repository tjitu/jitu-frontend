import random
import math

random.seed(2026)

width = 450
height = 450

svg_parts = []
svg_parts.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
# Pure crisp white background
svg_parts.append('  <rect width="100%" height="100%" fill="#FFFFFF" />')
svg_parts.append('  <g fill="#24211E">')

def add_circle(cx, cy, r, op):
    offsets_x = [0]
    if cx - r < 0: offsets_x.append(width)
    if cx + r > width: offsets_x.append(-width)
    offsets_y = [0]
    if cy - r < 0: offsets_y.append(height)
    if cy + r > height: offsets_y.append(-height)
    for ox in offsets_x:
        for oy in offsets_y:
            svg_parts.append(f'    <circle cx="{round(cx + ox, 2)}" cy="{round(cy + oy, 2)}" r="{round(r, 2)}" opacity="{round(op, 3)}" />')

def add_ellipse(cx, cy, rx, ry, rot, op):
    max_r = max(rx, ry)
    offsets_x = [0]
    if cx - max_r < 0: offsets_x.append(width)
    if cx + max_r > width: offsets_x.append(-width)
    offsets_y = [0]
    if cy - max_r < 0: offsets_y.append(height)
    if cy + max_r > height: offsets_y.append(-height)
    for ox in offsets_x:
        for oy in offsets_y:
            tx = round(cx + ox, 2)
            ty = round(cy + oy, 2)
            svg_parts.append(f'    <ellipse cx="{tx}" cy="{ty}" rx="{round(rx, 2)}" ry="{round(ry, 2)}" transform="rotate({rot} {tx} {ty})" opacity="{round(op, 3)}" />')

# "Kurangin dikit lagi": ~20-25% more gentle & refined
# 1. Micro-stipple tooth (very soft tactile paper ground)
for _ in range(1700):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(0.38, 0.75)
    op = random.uniform(0.06, 0.15)
    add_circle(x, y, r, op)

# 2. Medium paper specks
for _ in range(450):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(0.8, 1.35)
    op = random.uniform(0.10, 0.22)
    add_circle(x, y, r, op)

# 3. Organic fibers
for _ in range(220):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    rx = random.uniform(1.2, 2.2)
    ry = random.uniform(0.5, 0.9)
    rot = random.randint(0, 180)
    op = random.uniform(0.11, 0.24)
    add_ellipse(x, y, rx, ry, rot, op)

# 4. Accent flecks
for _ in range(60):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    rx = random.uniform(1.5, 2.6)
    ry = random.uniform(0.7, 1.2)
    rot = random.randint(0, 180)
    op = random.uniform(0.18, 0.32)
    add_ellipse(x, y, rx, ry, rot, op)

# 5. Natural micro-clusters
for _ in range(25):
    cx = random.uniform(0, width)
    cy = random.uniform(0, height)
    for _ in range(2):
        x = cx + random.uniform(-2.5, 2.5)
        y = cy + random.uniform(-2.5, 2.5)
        r = random.uniform(0.6, 1.1)
        op = random.uniform(0.12, 0.22)
        add_circle(x, y, r, op)

svg_parts.append('  </g>')
svg_parts.append('</svg>')

content = '\n'.join(svg_parts)
with open('c:/JITU-ECOSYSTEM/jitu-frontend/public/white-speckled-paper.svg', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Generated gently reduced white-speckled-paper.svg ({len(content)} bytes)")
