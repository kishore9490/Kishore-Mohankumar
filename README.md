# Kishore Mohankumar

Personal website — Cloud Architect · Product Builder · AI Entrepreneur.

A cinematic, single-page story built with Next.js, TypeScript, Tailwind CSS, Motion and a
small custom WebGL renderer. Design rationale lives in [`docs/DESIGN.md`](docs/DESIGN.md).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → ./out
npm start        # serve ./out locally
```

The build is a fully static site (`out/`) — deploy it to Vercel, Netlify, Cloudflare Pages,
GitHub Pages, S3 or any static host.

## Update the content

**Every word on the site lives in [`data/profile.ts`](data/profile.ts).** Edit it and rebuild —
no component changes needed.

| What                         | Where in `profile.ts`  |
|------------------------------|------------------------|
| Hero statement + live status | `hero`                 |
| Story                        | `about`                |
| Timeline chapters            | `journey`              |
| Projects (orbit + dossiers)  | `projects`             |
| Technology constellation     | `technologies`         |
| Systems / experience         | `systems`, `cvUrl`     |
| "What's happening now"       | `now` (bump `updated`) |
| Product lab ideas            | `lab`                  |
| Beyond the stack             | `beyond`               |
| Contact + social links       | `contact`, `social`    |

### Before going live — fill these in

- `url` — the final domain (used for canonical URL, Open Graph, sitemap, JSON-LD)
- `social.email` — enables **Start a conversation** by email (otherwise the message is copied to the clipboard)
- `social.linkedin`, `social.whatsapp` — links appear automatically once set
- `cvUrl` — drop a PDF in `public/` and point to it; until then the site says "CV available on request"
- Review `projects[].status`, `problem` and `learned`, and the `lab` ideas — they are written from
  the brief and should be checked against reality. Add `link` to any project with a public URL.

New technologies can be added to `technologies` without touching layout code — they place
themselves near their cluster. Projects take one of six generated visual signatures (`glyph`).

## The portrait

`public/media/` holds the processed portrait:

- `portrait-cutout.webp` / `-720.webp` — subject with transparency (desktop / mobile)
- `portrait-plate.webp` — the background with the subject removed (used by the WebGL depth layer)
- `portrait.jpg` — the original, compressed (structured data)

To replace the photo, generate a mask with [rembg](https://github.com/danielgatis/rembg)
(`rembg i -m birefnet-portrait -om photo.png mask.png`) and run
`python scripts/prepare-portrait.py photo.png mask.png public/media`.
If the new subject stands somewhere else in the frame, adjust `.hero-frame` in `app/globals.css`.

## Hidden things

- Press <kbd>`</kbd> anywhere to open the builder console (`help` lists commands).
- Click the **KM** mark five times quickly for Build Mode.
- `?quality=high|low|static` forces a rendering tier (useful for testing).

## Performance & accessibility notes

- The hero is complete without JavaScript; WebGL starts after load when the browser is idle,
  and is skipped on software GPUs, `prefers-reduced-motion` and Save-Data.
- Rendering pauses when the hero is off-screen or the tab is hidden.
- Lighthouse (local static build): desktop 100 performance · 97 accessibility · 100 best practices · 100 SEO;
  mobile 85 performance with the same other scores.
