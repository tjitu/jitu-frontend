import random
from PIL import Image, ImageDraw

random.seed(2026)

width = 1000
height = 1000

im = Image.new("RGBA", (width, height), (255, 255, 255, 255))
draw = ImageDraw.Draw(im)

def add_dot(x, y, r, fill):
    offsets_x = [0]
    if x - r < 0: offsets_x.append(width)
    if x + r > width: offsets_x.append(-width)
    offsets_y = [0]
    if y - r < 0: offsets_y.append(height)
    if y + r > height: offsets_y.append(-height)
    for ox in offsets_x:
        for oy in offsets_y:
            draw.ellipse([x + ox - r, y + oy - r, x + ox + r, y + oy + r], fill=fill)

# Gently reduced parameters (~20-25% lighter)
for _ in range(6500):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(0.5, 1.1)
    a = int(random.uniform(18, 42))
    add_dot(x, y, r, (35, 32, 28, a))

for _ in range(1600):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(1.0, 1.8)
    a = int(random.uniform(28, 58))
    add_dot(x, y, r, (30, 27, 24, a))

for _ in range(550):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(1.5, 2.8)
    a = int(random.uniform(32, 68))
    add_dot(x, y, r, (25, 23, 20, a))

for _ in range(160):
    x = random.uniform(0, width)
    y = random.uniform(0, height)
    r = random.uniform(2.0, 3.6)
    a = int(random.uniform(50, 85))
    add_dot(x, y, r, (20, 18, 16, a))

im.save("c:/JITU-ECOSYSTEM/jitu-frontend/public/white-speckled-paper.png", "PNG", optimize=True)
print("Saved gently reduced 1000x1000 seamless retina white-speckled-paper.png")
