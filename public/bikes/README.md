# Bike photography

Drop licensed Honda product images here — one folder per model slug:

```
public/bikes/hornet-2-0/hero.webp            ← main image (used in hero, cards, product page)
public/bikes/hornet-2-0/sports-red.webp      ← per colour (file name = colour id in data/bikes.ts)
public/bikes/activa-125/pearl-siren-blue.webp
```

* Side profile, facing **right**, transparent background (PNG/WebP cut-out) — ~2000 px wide.
* Re-run `npm run dev` / `npm run build` (the manifest regenerates automatically).
* Any model without a photo falls back to the studio illustration.

Slugs: activa-125, activa-110, dio-125, shine-100, shine-125, sp-125, unicorn, sp-160, hornet-2-0, nx200
