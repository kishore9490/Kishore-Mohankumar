# Drop the master logo here

The PDF builder looks for the supplied BID Trust artwork in this folder and, if
it finds it, embeds the real artwork in place of the vector reconstruction.

Add **one** of these (first match wins):

```
logo-on-dark.png     ← preferred: the version artworked for dark grounds
logo-on-dark.jpg
logo.png
```

Then rebuild:

```bash
python3 deck/build-pdf.py
```

The script prints which file it picked and how many marks it swapped, so you can
confirm the real artwork actually made it in rather than assuming it did.

Every mark in the deck is tagged `svg.bidmark`, so the swap reaches the title
slide, the top bar, the BID Card mockup and the closing slide in one pass.

**Why this folder exists:** the deck slides are dark navy, so the dark-ground
version of the logo is the one that belongs in the PDF. If you also want the
light-ground version used on the two light slides, say so and I'll wire it up —
it's a small change to `build-pdf.py`.
