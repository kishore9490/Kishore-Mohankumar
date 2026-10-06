# Kishore Mohankumar — Design & Build Notes

This document is the brief the site was built from. Content lives in `data/profile.ts`;
this file explains *why* the site looks and behaves the way it does.

---

## 1. Design direction — "Still Building"

A personal site presented like a product launch. The product is a person who builds.

- **Mood:** a dark hall at night, one warm light source. Taken directly from the portrait:
  the corridor lights, the warm wall wash, the bronze suit. The site extends the photograph
  instead of placing it in a box.
- **Signature move:** the portrait is split into two physical layers — the background plate
  (with Kishore removed) and the cutout of Kishore. The giant name sits *between* them.
  An orbit of infrastructure nodes passes behind him and in front of him. He is literally
  standing inside the system.
- **Language:** architectural drawings and operations consoles — hairlines, coordinates,
  indices, status lights. No cards-with-shadows, no blobs, no glass panels.
- **Rule:** every moving thing either tells you where you are, responds to you, or shows
  something being built.

## 2. Information architecture

One continuous story, top to bottom:

| #  | Anchor        | Visitor question          | Section                                |
|----|---------------|---------------------------|----------------------------------------|
| 00 | `#top`        | Who is this?              | Hero — portrait, name, live status     |
| 01 | `#about`      | What does he actually do? | Not just a job title (scroll-lit text) |
| 02 | `#journey`    | How did he get here?      | Seven chapters, horizontal track       |
| 03 | `#building`   | What has he built?        | Project orbit + dossier                |
| 04 | `#stack`      | What does he know?        | Technology constellation               |
| 05 | `#experience` | What problems can he own? | Systems I've built (index)             |
| 06 | `#now`        | What's he doing now?      | Live status board                      |
| 07 | `#lab`        | What's he thinking about? | Product lab specimens                  |
| 08 | `#beyond`     | Who is he outside work?   | Beyond the stack                       |
| 09 | `#contact`    | How do I start?           | Conversation composer                  |

Navigation exposes six destinations (About, Building, Experience, Lab, Now, Contact);
the section indicator always shows the true current chapter.

## 3. Visual system

- **Colour** (one accent, used sparingly):
  - `--ink` `#0A0A0B` — page
  - `--ink-2` `#121214` — raised surfaces
  - `--paper` `#ECE6DC` — primary text (warm off-white, never pure white)
  - `--mute` `#8D877E` — secondary text (AA on ink)
  - `--line` paper @ 10% — hairlines
  - `--amber` `#F2A541` — *signal*. Status lights, the active thing, the cursor light, arrows.
- **Type:**
  - Display — *Inter Tight* 600, uppercase, tracking −0.045em, sizes up to 15vw.
  - Body — *Inter* 400, 17–19px, generous leading.
  - System — *JetBrains Mono* 11–12px uppercase, tracking 0.14em. Labels, indices, status.
- **Shape:** square corners. The only round object is the navigation capsule (a physical control).
- **Grid:** 12 columns, 16px gutter on mobile, 4vw page margins on desktop.
  Faint vertical guides at the page margins run the full length of the site.

## 4. Animation strategy

- **Intro (≈2.4s):** darkness → plate fades up with a light sweep → Kishore rises out of
  the dark (clip + blur → sharp) → name slides out of masks → status line starts typing.
- **Scroll:** Lenis smooth scrolling, Motion scroll-linked values. Text lights word by word
  (About), a horizontal track (Journey), an orbit that turns with scroll (Building).
- **Micro:** magnetic CTAs, a cursor that announces intent (`OPEN`, `DRAG`, `VIEW`),
  a velocity-reactive marquee, an amber cursor light on the portrait.
- **Reduced motion:** all of the above collapse to opacity fades; WebGL renders one still frame.

## 5. 3D strategy

- Custom **raw WebGL** renderer (≈ 8 KB) instead of Three.js (≈ 150 KB gz): the hero needs a
  textured quad with a depth shader, a particle field and two line loops. Nothing else.
- Two canvases share one scene description: the **back** layer draws the plate, far dust and the
  rear half of the orbit; the **front** layer draws near dust and the front half of the orbit.
  DOM name + cutout sit between them. True occlusion without a depth map.
- Plate parallax uses a procedural depth (corridor recedes left, wall is near on the right).
- Particles are repelled by the cursor in the vertex shader. No CPU work per particle.
- Rendering pauses when the hero is off-screen or the tab is hidden.
- The project orbit and constellation are CSS 3D / SVG — interactive, accessible DOM elements
  that are cheaper than WebGL and work with keyboards and screen readers.

## 6. Component architecture

```
app/            layout (metadata, fonts, JSON-LD), page, sitemap, robots, icon
components/
  3d/           HeroScene (WebGL engine), glyphs, wireframe specimens
  sections/     one file per chapter
  ui/           Nav, Cursor, Magnetic, Console, BuildMode, SectionHeader, Reveal
data/profile.ts every word on the site
hooks/          useMediaCapabilities, useActiveSection, usePointer
lib/            smooth scroll, store, utils
```

## 7. Responsive strategy

- **Mobile is its own composition:** portrait fills the top of the screen, the name sits across
  his chest, status and CTA beneath. Navigation becomes a bottom capsule within thumb reach.
- Journey becomes a vertical chapter stack; the orbit becomes a swipe rail;
  the constellation keeps its graph but swaps hover for tap.
- Capability tiers (`high` / `low` / `static`) from pointer type, screen size, core count,
  device memory and `prefers-reduced-motion` decide particle counts, front layer, and cursor.

## 8. Performance strategy

- Static export (`out/`), no server.
- LCP element is the cutout `<img>` with `fetchpriority="high"`; WebGL loads after.
- Pre-optimised WebP assets (cutout 69 KB, plate 30 KB, mobile cutout 39 KB).
- Fonts via `next/font` (self-hosted, subset, swap).
- No Three.js, no icon libraries. Dependencies: next, react, motion, lenis.
- DPR capped at 1.5 (1 on low tier). Animations use transform/opacity only.
