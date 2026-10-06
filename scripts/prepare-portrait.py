"""
Prepare hero portrait assets.

Input : original portrait + subject mask (white = subject).
        The mask was produced with rembg (birefnet-portrait):
            rembg i -m birefnet-portrait -om portrait.png mask.png
Output: public/media/
          portrait-cutout.webp      subject with alpha (desktop)
          portrait-cutout-720.webp  subject with alpha (mobile)
          portrait-plate.webp       background with the subject removed (push-pull fill)
          portrait.jpg              original, compressed (OG / structured data)

Usage: python scripts/prepare-portrait.py portrait.png mask.png public/media
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

src, mask_path, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)

im = Image.open(src).convert("RGB")
mask = Image.open(mask_path).convert("L").resize(im.size, Image.LANCZOS)

# 1. Cutout — slightly tightened, feathered edge
m = np.asarray(mask).astype(np.float32) / 255.0
m = np.clip((m - 0.08) / 0.84, 0, 1)
alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
cut = im.copy(); cut.putalpha(alpha)
cut.save(f"{out}/portrait-cutout.webp", "WEBP", quality=86, method=6)
w720 = 720; h720 = round(im.height * w720 / im.width)
cut.resize((w720, h720), Image.LANCZOS).save(f"{out}/portrait-cutout-720.webp", "WEBP", quality=82, method=6)

# 2. Plate — remove subject with a push-pull pyramid fill
hole = np.asarray(mask.filter(ImageFilter.MaxFilter(61))).astype(np.float32) / 255.0 > 0.04
img = np.asarray(im).astype(np.float32) / 255.0
w = (~hole).astype(np.float32)

def down(c, wt):
    h, ww = wt.shape
    h2, w2 = h // 2 * 2, ww // 2 * 2
    c = c[:h2, :w2]; wt = wt[:h2, :w2]
    cs = c.reshape(h2 // 2, 2, w2 // 2, 2, 3).sum((1, 3))
    ws = wt.reshape(h2 // 2, 2, w2 // 2, 2).sum((1, 3))
    return cs, ws

levels = []
c, wt = img * w[..., None], w.copy()
while min(wt.shape) > 1:
    levels.append((c, wt))
    c, wt = down(c, wt)
levels.append((c, wt))

fill = c / np.maximum(wt, 1e-6)[..., None]
for c, wt in reversed(levels[:-1]):
    up = np.asarray(Image.fromarray((np.clip(fill, 0, 1) * 255).astype(np.uint8)).resize((wt.shape[1], wt.shape[0]), Image.BILINEAR)).astype(np.float32) / 255.0
    known = c / np.maximum(wt, 1e-6)[..., None]
    a = np.clip(wt, 0, 1)[..., None]
    fill = known * a + up * (1 - a)

plate = img * w[..., None] + fill * (1 - w[..., None])
plate_im = Image.fromarray((np.clip(plate, 0, 1) * 255).astype(np.uint8))
# soften the filled region so it reads as out-of-focus depth
soft = plate_im.filter(ImageFilter.GaussianBlur(22))
hm = Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))
plate_im = Image.composite(soft, plate_im, hm).filter(ImageFilter.GaussianBlur(1.2))
plate_im.save(f"{out}/portrait-plate.webp", "WEBP", quality=72, method=6)

# 3. Original, compressed
im.save(f"{out}/portrait.jpg", "JPEG", quality=84, optimize=True, progressive=True)
print("done")
