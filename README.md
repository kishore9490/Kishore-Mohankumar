# Infinitia Hub Poster Studio

A lightweight, single-page poster maker for Infinitia Hub and AI Studio Craft.
Pick one of **137 editable templates**, change the text, add your logo and contact details, preview it live, then download a correctly sized PNG or JPEG. No server, database, login or paid API is needed. Everything runs and is stored in your browser.

## Quick start (local)

Browsers block some features on `file://` pages, so serve the folder with any static server:

```bash
# Python 3 (already installed on most Macs/Linux)
python3 -m http.server 8080
# or Node
npx serve .
```

Then open <http://localhost:8080>.

## Deploy

Upload the folder as-is to any static host: GitHub Pages, Netlify, Vercel, Cloudflare Pages, an S3 bucket or shared hosting. There is no build step.

- **GitHub Pages:** repository → Settings → Pages → *Deploy from a branch* → choose the branch and `/ (root)`.
- **Netlify:** drag the folder onto <https://app.netlify.com/drop>.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure (gallery, My Designs, editor, dialogs) |
| `style.css` | All styling, including responsive/mobile layout |
| `templates.js` | Template registry: sizes, categories, palettes, design recipes and the 137 templates |
| `renderer.js` | Canvas rendering engine shared by preview, thumbnails and export |
| `app.js` | UI: gallery, search/filters, editor, Brand Kit, saving, import/export |
| `assets/` | Optional place for your own logos, fonts or images |

## Using it

1. **Brand Kit** (top bar): enter your real company name, website, phone, WhatsApp number, colours and preferred font, and upload your logo. The fields start empty on purpose; until you fill them, posters show placeholders such as `www.yourwebsite.com`. **Import Logo** is a shortcut to upload the logo for the default brand.
2. **Find a template:** browse categories, search (name, category, style, keywords), filter by format, colour, style or brand, sort, and ♥ favourites.
3. **Edit:** *Content* (text, contacts, images, show/hide any element), *Design* (backgrounds, gradient presets, colours, fonts, sizes, alignment, spacing, padding, radius, logo/image placement, decorations), *Brand* (choose the brand for this poster, apply brand colours/font) and *Size* (presets or a custom size). The *Layers* panel lists every element with a visibility toggle.
4. **Undo/redo** (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z), **Reset** to template, **Duplicate**, **Change template** (optionally keeping your text), **Save** (Ctrl/⌘+S).
5. **Download:** PNG at the exact poster size, JPEG (quality selectable), *Print PNG* (up to 3× resolution, about 16 MP max), or *Project JSON*.
6. **My Designs:** open, rename, duplicate, delete, export JSON, and import a JSON project (for example, to move a design to another computer).

### Sizes

Instagram portrait 1080×1350 · Instagram square 1080×1080 · Story/WhatsApp Status 1080×1920 · Facebook 1200×630 · LinkedIn 1200×627 · WhatsApp poster 1080×1350 · A4 portrait 2480×3508 (300 dpi) · custom (200 to 6000 px per side).

### Storage

- Design data (text and settings) is saved in `localStorage`.
- Uploaded images are downscaled (logos to 1200 px, photos to 2600 px), compressed and saved once as binary blobs in IndexedDB rather than as base64 text, so storage stays small.
- If storage is unavailable (private browsing) or full, the app tells you and offers a JSON export. Clearing your browser's site data deletes saved designs, so export the ones you want to keep.
- Exported JSON files embed the images, so they are fully portable.

### Export notes

- The export uses the same renderer as the preview, at full resolution, after fonts and images have loaded. It never screenshots the page.
- Fonts come from Google Fonts. If you are offline, a system font is used and the app warns you.
- Images added from a link are downloaded first. If the host blocks cross-origin use, you get a warning and should upload the file instead.
- Transparent PNG backgrounds are available only on templates that support them (for example the plain quote and bold-type templates). JPEG is always opaque.

## Customising templates

Each template in `templates.js` is a short entry in `ENTRIES`:

```js
{ n: 'Template name', c: 'Category', r: 'recipeKey', p: 'paletteKey', z: 'ig-portrait',
  x: t('Tag', 'Headline', 'Subheadline', 'Description', ['Feature 1', 'Feature 2'], 'CTA', 'Footer'),
  v: { /* optional overrides: L (layout options), d (decorations), ft (footer), lg (logo position), fo (fonts) */ } }
```

- **Recipes** (`RECIPES`) define a composition: layout type, background, decorations, fonts, footer and logo position. Edit one to restyle every template that uses it.
- **Palettes** (`PALETTES`) define the colours.
- **Layouts** available: hero, minimal, split, card, editorial, features, grid (tiles/stats), offer (burst/circle/ticket), testimonial, compare, announce, invite, quote, showcase, photo (bottom/side/framed), bold, diagonal, hiring, event, steps, chat.
- **Decorations** (in `renderer.js` → `DECOR`): blobs, rings, circles, dots, grid, waves, triangles, stripes, confetti, mandala, rangoli, diyas, sparkles, hexagons, neon, corners, frame, orbits, bars, arcs, zigzag, squares, circuit, bokeh, halftone, bunting, leaves, mountains, skyline, cross, bigtext, sunburst, plus, crescent, fireworks, lines, glow.

Special text conventions: in **comparison** templates, write each feature line as `left | right`; in **stats** tiles, `value | label`; in **chat** templates, the lines alternate customer and business messages; in **event** templates, the tag is the calendar badge (e.g. `24 NOV`).

All sample copy (offers, quotes, statistics, dates) is placeholder text to edit. It is not a claim about real results, prices, certifications or partnerships.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop and mobile).
