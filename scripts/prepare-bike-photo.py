#!/usr/bin/env python3
"""
Prepare a bike product photo for the showroom.

  python3 scripts/prepare-bike-photo.py <input> <output.webp> [--flip]

* Removes a plain white / light-grey studio background (flood-filled from the
  edges, so light paint on the bike itself is kept) and turns the floor shadow
  into a soft dark shadow that works on the dark studio surfaces.
* Images that already have transparency are kept as they are.
* Trims and places the bike in a standard 2000×1200 (5:3) frame with the tyres
  touching the ground line at 90% height — the same frame the studio
  illustrations, product hotspots and the 3D hero assume.

Requires Pillow and NumPy.
"""
import sys
import numpy as np
from PIL import Image

W, H, GROUND = 2000, 1200, 1076
BOX_W, BOX_H = 1760, 1000


def remove_background(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    f = rgb.astype(np.float32)
    raw_lum = f.mean(axis=2)
    sat = f.max(axis=2) - f.min(axis=2)
    # Light blur so JPEG noise doesn't stop the flood fill.
    k = 2
    pad = np.pad(raw_lum, k, mode="edge")
    lum = sum(pad[dy : dy + h, dx : dx + w] for dy in range(2 * k + 1) for dx in range(2 * k + 1)) / (2 * k + 1) ** 2
    # Background level sampled from the border.
    border = np.concatenate([lum[0], lum[-1], lum[:, 0], lum[:, -1]])
    bg = float(np.percentile(border, 60))

    candidate = (sat < 30) & (lum > bg - 70)
    # Connected-to-border flood fill (iterative constrained dilation), which
    # only walks across smooth gradients so the bike's outline stops it.
    grad = np.zeros_like(lum)
    grad[1:-1, 1:-1] = np.maximum(
        np.abs(lum[2:, 1:-1] - lum[:-2, 1:-1]), np.abs(lum[1:-1, 2:] - lum[1:-1, :-2])
    )
    walkable = candidate & (grad < 20)
    mask = np.zeros((h, w), bool)
    mask[0], mask[-1], mask[:, 0], mask[:, -1] = walkable[0], walkable[-1], walkable[:, 0], walkable[:, -1]
    while True:
        grown = mask.copy()
        grown[1:] |= mask[:-1]
        grown[:-1] |= mask[1:]
        grown[:, 1:] |= mask[:, :-1]
        grown[:, :-1] |= mask[:, 1:]
        grown &= walkable
        if (grown == mask).all():
            break
        mask = grown

    # Clean the halo: near-white pixels touching the background join it.
    near_white = (raw_lum > bg - 40) & (sat < 34)
    for _ in range(4):
        grown = mask.copy()
        grown[1:] |= mask[:-1]
        grown[:-1] |= mask[1:]
        grown[:, 1:] |= mask[:, :-1]
        grown[:, :-1] |= mask[:, 1:]
        mask = mask | (grown & near_white)
    # Pure-background pockets enclosed by wheels/shadow (lower part of frame only,
    # so white paint on the bodywork is never touched).
    pocket = (raw_lum > bg - 14) & (sat < 14)
    pocket[: int(h * 0.42)] = False
    mask |= pocket
    lum = raw_lum

    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = rgb
    out[..., 3] = 255
    # Background → transparent; darker background (floor shadow) → soft black.
    shade = np.clip((bg - lum) / max(bg, 1) * 2.2, 0, 0.75)
    out[mask, :3] = 0
    out[mask, 3] = (shade[mask] * 255).astype(np.uint8)

    # Feather the 1px rim where the bike was anti-aliased against white.
    rim = np.zeros_like(mask)
    rim[1:] |= mask[:-1]
    rim[:-1] |= mask[1:]
    rim[:, 1:] |= mask[:, :-1]
    rim[:, :-1] |= mask[:, 1:]
    rim &= ~mask
    out[rim, 3] = (out[rim, 3] * 0.55).astype(np.uint8)
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    flip = "--flip" in sys.argv
    im = Image.open(src).convert("RGBA")
    a = np.array(im)
    if (a[..., 3] < 250).mean() < 0.05:  # opaque image → cut out
        a = remove_background(a[..., :3])
    im = Image.fromarray(a)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)

    alpha = np.array(im)[..., 3]
    ys, xs = np.where(alpha > 16)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    # Ground = lowest clearly opaque row (tyres), not the faint shadow.
    solid_rows = np.where((np.array(im)[..., 3] > 200).any(axis=1))[0]
    tyre_bottom = solid_rows.max() + 1

    scale = min(BOX_W / im.width, BOX_H / tyre_bottom)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - im.width) // 2
    y = GROUND - round(tyre_bottom * scale)
    canvas.alpha_composite(im, (x, max(0, y)))
    canvas.save(dst, "WEBP", quality=88, method=6)
    print(f"{dst}: {im.width}x{im.height} scale {scale:.2f}")


if __name__ == "__main__":
    main()
