/* Infinitia Hub Poster Studio — template registry.
 *
 * A template = recipe (composition: layout, background, decorations, fonts, header/footer)
 *            + palette (colours) + sample copy + optional overrides (`v`).
 * To add a template, append an entry to ENTRIES. To restyle many at once, edit a recipe or palette.
 * Sample copy is editable placeholder text, not claims about real results, prices or partnerships. */
(function (root) {
  'use strict';

  const SIZES = {
    'ig-portrait': { label: 'Instagram Portrait', w: 1080, h: 1350, format: 'portrait' },
    'ig-square': { label: 'Instagram Square', w: 1080, h: 1080, format: 'square' },
    'story': { label: 'Story / WhatsApp Status', w: 1080, h: 1920, format: 'story' },
    'facebook': { label: 'Facebook Landscape', w: 1200, h: 630, format: 'landscape' },
    'linkedin': { label: 'LinkedIn Landscape', w: 1200, h: 627, format: 'landscape' },
    'wa-poster': { label: 'WhatsApp Promo Poster', w: 1080, h: 1350, format: 'portrait' },
    'a4': { label: 'A4 Portrait (print)', w: 2480, h: 3508, format: 'a4' }
  };

  const CATEGORIES = [
    'Company Branding', 'WhatsApp Marketing', 'Instagram Posts', 'Festival Greetings', 'Business Promotions',
    'Product Promotions', 'Service Promotions', 'Technology & AI', 'Website & App Launches', 'Offers & Discounts',
    'Testimonials', 'Business Announcements', 'Hiring & Careers', 'Educational Promotions', 'Real Estate',
    'Healthcare', 'Travel & Tourism', 'Corporate Events', 'Motivational Quotes', 'Digital Invitations'
  ];

  const FAMILIES = {
    minimal: 'Minimal Corporate', luxury: 'Luxury Black & Gold', gradient: 'Modern Gradient', bold: 'Bold Typography',
    glass: 'Glassmorphism', geometric: 'Geometric Pattern', editorial: 'Editorial', tech: 'Dark Technology',
    neon: 'Neon Futuristic', clean: 'Clean White Business', product: 'Product Showcase', photo: 'Photo-led Promo',
    abstract: 'Abstract Shapes', festive: 'Festive Indian', invitation: 'Elegant Invitation', announcement: 'Announcement Card',
    testimonial: 'Testimonial & Review', comparison: 'Service Comparison', offer: 'Offer & Discount', infographic: 'Infographic & Features'
  };

  const TONES = { light: 'Light', dark: 'Dark', colorful: 'Colorful', gold: 'Gold & Luxe', pastel: 'Pastel', neon: 'Neon' };

  // [bg1, bg2, bg3, text, muted, accent, accent2, tone]
  const PALETTES = {
    royal: ['#1E1B4B', '#4C1D95', '#312E81', '#FFFFFF', '#C7D2FE', '#A78BFA', '#60A5FA', 'dark'],
    electric: ['#0B1026', '#1E3A8A', '#0F172A', '#FFFFFF', '#BFDBFE', '#38BDF8', '#A855F7', 'dark'],
    clean: ['#FFFFFF', '#F1F5F9', '#EEF2FF', '#0F172A', '#475569', '#6D28D9', '#2563EB', 'light'],
    softGrey: ['#F8FAFC', '#E2E8F0', '#F1F5F9', '#1E293B', '#64748B', '#4F46E5', '#0EA5E9', 'light'],
    goldNoir: ['#0B0B0F', '#1C1917', '#000000', '#F5F5F4', '#A8A29E', '#D4AF37', '#F5D67B', 'gold'],
    champagne: ['#FBF7EF', '#F3E9D2', '#FFFDF7', '#3B2F1E', '#7C6A4F', '#B8860B', '#8B5E34', 'gold'],
    sunset: ['#F97316', '#DB2777', '#7C3AED', '#FFFFFF', '#FFE4E6', '#FDE68A', '#FFFFFF', 'colorful'],
    ocean: ['#0EA5E9', '#2563EB', '#1E40AF', '#FFFFFF', '#DBEAFE', '#FDE047', '#FFFFFF', 'colorful'],
    mint: ['#ECFDF5', '#D1FAE5', '#F0FDFA', '#064E3B', '#047857', '#059669', '#0D9488', 'pastel'],
    lavender: ['#F5F3FF', '#EDE9FE', '#FAF5FF', '#2E1065', '#6B21A8', '#7C3AED', '#DB2777', 'pastel'],
    peach: ['#FFF7ED', '#FFEDD5', '#FFFBEB', '#431407', '#9A3412', '#EA580C', '#E11D48', 'pastel'],
    neonCyber: ['#05010F', '#1A0B3B', '#05010F', '#FFFFFF', '#C4B5FD', '#22D3EE', '#F0ABFC', 'neon'],
    neonLime: ['#030712', '#0B1120', '#030712', '#F9FAFB', '#9CA3AF', '#A3E635', '#22D3EE', 'neon'],
    matrix: ['#020617', '#0F2A2A', '#020617', '#ECFEFF', '#99F6E4', '#34D399', '#38BDF8', 'dark'],
    crimson: ['#7F1D1D', '#DC2626', '#450A0A', '#FFFFFF', '#FECACA', '#FDE68A', '#FFFFFF', 'colorful'],
    saffron: ['#7C2D12', '#C2410C', '#431407', '#FFF7ED', '#FED7AA', '#FCD34D', '#FDE68A', 'colorful'],
    maroon: ['#4A0E1F', '#881337', '#2A0612', '#FFF1F2', '#FBCFE8', '#F59E0B', '#FDE68A', 'gold'],
    peacock: ['#064E3B', '#0F766E', '#022C22', '#F0FDFA', '#99F6E4', '#FBBF24', '#A78BFA', 'colorful'],
    holi: ['#DB2777', '#7C3AED', '#2563EB', '#FFFFFF', '#FCE7F3', '#FACC15', '#22D3EE', 'colorful'],
    forest: ['#14532D', '#166534', '#052E16', '#F0FDF4', '#BBF7D0', '#BEF264', '#FDE68A', 'dark'],
    medical: ['#F0F9FF', '#E0F2FE', '#FFFFFF', '#0C4A6E', '#0369A1', '#0284C7', '#14B8A6', 'light'],
    teal: ['#134E4A', '#0F766E', '#042F2E', '#F0FDFA', '#99F6E4', '#5EEAD4', '#FDE68A', 'dark'],
    sand: ['#FEF3C7', '#FDE68A', '#FFFBEB', '#451A03', '#92400E', '#B45309', '#0E7490', 'pastel'],
    sky: ['#E0F2FE', '#BAE6FD', '#F0F9FF', '#0C4A6E', '#0369A1', '#0EA5E9', '#F97316', 'light'],
    charcoal: ['#18181B', '#27272A', '#09090B', '#FAFAFA', '#A1A1AA', '#F43F5E', '#FB923C', 'dark'],
    slate: ['#1E293B', '#334155', '#0F172A', '#F8FAFC', '#CBD5E1', '#F59E0B', '#38BDF8', 'dark'],
    rose: ['#FFF1F2', '#FFE4E6', '#FFF7F7', '#4C0519', '#9F1239', '#E11D48', '#F59E0B', 'pastel'],
    blush: ['#FDF2F8', '#FCE7F3', '#FFFFFF', '#500724', '#9D174D', '#BE185D', '#B8860B', 'pastel'],
    emeraldGold: ['#022C22', '#064E3B', '#011A14', '#ECFDF5', '#A7F3D0', '#D4AF37', '#F5D67B', 'gold'],
    navyGold: ['#0B1B3F', '#13265C', '#060F26', '#F8FAFC', '#CBD5E1', '#E6C068', '#F5D67B', 'gold'],
    yellow: ['#FACC15', '#FDE047', '#FEF08A', '#111827', '#374151', '#111827', '#DC2626', 'colorful'],
    redOffer: ['#DC2626', '#991B1B', '#7F1D1D', '#FFFFFF', '#FEE2E2', '#FDE047', '#FFFFFF', 'colorful'],
    brand: ['#6D28D9', '#2563EB', '#4338CA', '#FFFFFF', '#E0E7FF', '#FDE68A', '#A5F3FC', 'colorful'],
    aurora: ['#0F172A', '#312E81', '#1E1B4B', '#FFFFFF', '#C7D2FE', '#22D3EE', '#F472B6', 'dark'],
    paper: ['#FAFAF9', '#F5F5F4', '#FFFFFF', '#1C1917', '#57534E', '#DC2626', '#1C1917', 'light'],
    ink: ['#111111', '#1A1A1A', '#000000', '#F5F5F5', '#A3A3A3', '#FACC15', '#F5F5F5', 'dark'],
    coral: ['#FF6B6B', '#FFB88C', '#FF8E72', '#FFFFFF', '#FFF1EB', '#1F2937', '#FFFFFF', 'colorful'],
    indigo: ['#EEF2FF', '#E0E7FF', '#F5F7FF', '#1E1B4B', '#4338CA', '#4F46E5', '#9333EA', 'light'],
    grape: ['#3B0764', '#6B21A8', '#2E1065', '#FAF5FF', '#E9D5FF', '#F0ABFC', '#FDE68A', 'dark'],
    steel: ['#E5E7EB', '#D1D5DB', '#F3F4F6', '#111827', '#4B5563', '#2563EB', '#0EA5E9', 'light'],
    cream: ['#FFFBF5', '#F7EEDD', '#FFFFFF', '#2B2118', '#6B5B4B', '#C2410C', '#0F766E', 'light'],
    tricolor: ['#FFFFFF', '#FFF7ED', '#F0FDF4', '#0B2265', '#334155', '#FF9933', '#138808', 'light'],
    night: ['#0A0F2C', '#1B1F4B', '#05071A', '#FFFFFF', '#C7D2FE', '#FDE68A', '#F472B6', 'dark'],
    olive: ['#F7F7EE', '#E9EDD5', '#FFFFFF', '#1F2A14', '#4D5B32', '#5B7C1E', '#C2410C', 'light']
  };

  /* Recipes: f family · L layout · bg background · d decorations · fo fonts · ft footer · lg logo position
   * hl headline highlight · rad corner radius (0–1) · pad safe margin (fraction of short side) · lh line height */
  const RECIPES = {
    minimalLeft: { f: 'minimal', L: { type: 'minimal', align: 'left', tagStyle: 'text' }, bg: { type: 'solid' }, d: [{ t: 'lines', pos: 'tr', c: 'accent', a: 0.6 }], fo: ['Inter', 'Inter', 800], ft: 'line', lg: 'top-left', rad: 0.3, pad: 0.085, transparentOk: true },
    minimalHero: { f: 'minimal', L: { type: 'hero', align: 'left', tagStyle: 'text', ctaStyle: 'link', featStyle: 'dot', maxW: 0.86, divider: 'line' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'dots', pos: 'br', c: 'accent', a: 0.35 }], fo: ['Outfit', 'Inter', 700], ft: 'minimal', lg: 'top-left', hl: 'accentLast' },
    luxFrame: { f: 'luxury', L: { type: 'invite', align: 'center', tagStyle: 'text', ctaStyle: 'outline', divider: 'diamond' }, bg: { type: 'radial', cx: 0.5, cy: 0.35 }, d: [{ t: 'frame', double: true, c: 'accent', a: 0.9 }, { t: 'corners', c: 'accent', a: 0.9 }], fo: ['Playfair Display', 'Montserrat', 700], ft: 'minimal', lg: 'top-center', hl: 'gradient', lh: 1.12 },
    luxCenter: { f: 'luxury', L: { type: 'hero', align: 'center', tagStyle: 'outline', ctaStyle: 'solid', divider: 'line', featStyle: 'dot' }, bg: { type: 'spotlight', angle: 180 }, d: [{ t: 'sparkles', c: 'accent', a: 0.7, n: 14 }, { t: 'arcs', c: 'accent', a: 0.35 }], fo: ['Cormorant Garamond', 'Raleway', 700], ft: 'line', lg: 'top-center', hl: 'gradient', lh: 1.05 },
    luxSplit: { f: 'luxury', L: { type: 'split', side: 'left', panel: 'arch', ratio: 0.45, tagStyle: 'text', ctaStyle: 'outline', featStyle: 'dot' }, bg: { type: 'solid' }, d: [{ t: 'frame', c: 'accent', a: 0.6 }], fo: ['DM Serif Display', 'Montserrat', 400], ft: 'stack', lg: 'top-left', lh: 1.1 },
    gradHero: { f: 'gradient', L: { type: 'hero', align: 'center', tagStyle: 'soft', ctaStyle: 'white', featStyle: 'pill' }, bg: { type: 'linear', angle: 135 }, d: [{ t: 'blobs', n: 3, a: 0.35 }, { t: 'rings', pos: 'tr', c: 'text', a: 0.15 }], fo: ['Poppins', 'Poppins', 800], ft: 'pills', lg: 'top-center' },
    gradCard: { f: 'gradient', L: { type: 'card', card: 'solid', align: 'left', tagStyle: 'pill', ctaStyle: 'arrow', featStyle: 'check' }, bg: { type: 'linear', angle: 160 }, d: [{ t: 'circles', pos: 'tr', c: 'accent2', a: 0.3 }, { t: 'dots', pos: 'bl', c: 'text', a: 0.35 }], fo: ['Montserrat', 'Inter', 800], ft: 'bar-dark', lg: 'top-left' },
    cardOffset: { f: 'gradient', L: { type: 'card', card: 'offset', align: 'center', tagStyle: 'soft', ctaStyle: 'solid', featStyle: 'check', maxW: 0.94 }, bg: { type: 'linear', angle: 200 }, d: [{ t: 'squares', pos: 'bl', c: 'accent', a: 0.35 }, { t: 'plus', pos: 'tr', c: 'accent', a: 0.5 }], fo: ['Outfit', 'Inter', 800], ft: 'line', lg: 'top-center' },
    gradDiagonal: { f: 'gradient', L: { type: 'diagonal', align: 'left', tagStyle: 'pill', ctaStyle: 'white' }, bg: { type: 'linear', angle: 200 }, d: [{ t: 'stripes', pos: 'tr', c: 'text', a: 0.14 }], fo: ['Outfit', 'Outfit', 800], ft: 'bar-dark', lg: 'top-left' },
    boldStack: { f: 'bold', L: { type: 'bold', mode: 'stack', align: 'left', tagStyle: 'pill', ctaStyle: 'solid' }, bg: { type: 'solid' }, d: [{ t: 'zigzag', pos: 'tr', c: 'accent', a: 0.9 }], fo: ['Bebas Neue', 'Inter', 400, true], ft: 'line', lg: 'top-left', hl: 'accentLast', lh: 0.95, transparentOk: true },
    boldOutline: { f: 'bold', L: { type: 'bold', mode: 'wrap', align: 'center', tagStyle: 'text', ctaStyle: 'outline', fillMax: 1.3 }, bg: { type: 'solid' }, d: [{ t: 'plus', pos: 'bl', c: 'accent', a: 0.55 }, { t: 'plus', pos: 'tr', c: 'accent', a: 0.55 }], fo: ['Archivo Black', 'Inter', 400, true], ft: 'minimal', lg: 'top-center', hl: 'outline', lh: 1.02 },
    boldGiant: { f: 'bold', L: { type: 'bold', mode: 'wrap', align: 'left', tagStyle: 'ribbon', ctaStyle: 'arrow', fillMax: 1.25 }, bg: { type: 'split' }, d: [{ t: 'bigtext', pos: 'r', a: 0.08 }], fo: ['Montserrat', 'Montserrat', 900, true], ft: 'bar', lg: 'top-right', hl: 'marker', lh: 1.0 },
    glassCard: { f: 'glass', L: { type: 'card', card: 'glass', align: 'center', tagStyle: 'soft', ctaStyle: 'solid', featStyle: 'check' }, bg: { type: 'mesh' }, d: [{ t: 'bokeh', n: 8, a: 0.25 }], fo: ['Outfit', 'Inter', 700], ft: 'pills', lg: 'top-center' },
    glassFeatures: { f: 'glass', L: { type: 'features', align: 'left', tagStyle: 'soft', featStyle: 'card', ctaStyle: 'arrow' }, bg: { type: 'mesh' }, d: [{ t: 'rings', pos: 'br', c: 'text', a: 0.12 }], fo: ['Space Grotesk', 'Inter', 700], ft: 'line', lg: 'top-left' },
    geoTriangles: { f: 'geometric', L: { type: 'hero', align: 'left', tagStyle: 'pill', ctaStyle: 'solid', featStyle: 'arrow' }, bg: { type: 'solid' }, d: [{ t: 'triangles', n: 9, c: 'accent', a: 0.55 }, { t: 'squares', pos: 'br', c: 'accent', a: 0.4 }], fo: ['Montserrat', 'Inter', 800], ft: 'line', lg: 'top-left' },
    geoHex: { f: 'geometric', L: { type: 'grid', mode: 'tiles', align: 'center', tagStyle: 'pill', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'hexagons', pos: 'tr', c: 'accent', a: 0.4 }, { t: 'hexagons', pos: 'bl', c: 'accent2', a: 0.3 }], fo: ['Space Grotesk', 'Inter', 700], ft: 'bar', lg: 'top-center' },
    geoSquares: { f: 'geometric', L: { type: 'split', side: 'right', panel: 'full', ratio: 0.42, tagStyle: 'text', ctaStyle: 'solid', featStyle: 'check' }, bg: { type: 'solid' }, d: [{ t: 'squares', pos: 'tl', c: 'accent', a: 0.3 }], fo: ['Poppins', 'Poppins', 700], ft: 'stack', lg: 'top-left' },
    editorialRule: { f: 'editorial', L: { type: 'editorial', align: 'left' }, bg: { type: 'solid' }, d: [], fo: ['Playfair Display', 'Lora', 800], ft: 'line', lg: 'bottom-left', lh: 1.02 },
    editorialBoxed: { f: 'editorial', L: { type: 'editorial', align: 'left', mastRight: 'Vol. 01' }, bg: { type: 'solid' }, d: [{ t: 'frame', c: 'text', a: 0.8 }], fo: ['DM Serif Display', 'Inter', 400], ft: 'minimal', lg: 'top-right', hl: 'marker', lh: 1.05 },
    techCircuit: { f: 'tech', L: { type: 'hero', align: 'left', tagStyle: 'outline', ctaStyle: 'glow', featStyle: 'check', maxW: 0.9 }, bg: { type: 'radial', cx: 0.8, cy: 0.2 }, d: [{ t: 'circuit', n: 7, c: 'accent', a: 0.45 }, { t: 'grid', c: 'accent', a: 0.06 }], fo: ['Space Grotesk', 'Inter', 700], ft: 'line', lg: 'top-left', hl: 'gradient' },
    techFeatures: { f: 'tech', L: { type: 'features', align: 'left', tagStyle: 'soft', featStyle: 'number', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 160 }, d: [{ t: 'grid', c: 'accent', a: 0.08 }, { t: 'glow', pos: 'tr', c: 'accent', a: 0.35 }], fo: ['Outfit', 'Inter', 800], ft: 'bar-dark', lg: 'top-left', hl: 'accentLast' },
    techOrbit: { f: 'tech', L: { type: 'showcase', mode: 'circle', align: 'center', tagStyle: 'pill', ctaStyle: 'glow' }, bg: { type: 'radial', cx: 0.5, cy: 0.35 }, d: [{ t: 'orbits', pos: 'c', c: 'accent', a: 0.35 }, { t: 'sparkles', n: 10, c: 'accent2', a: 0.6 }], fo: ['Orbitron', 'Inter', 800], ft: 'pills', lg: 'top-center' },
    neonLines: { f: 'neon', L: { type: 'hero', align: 'center', tagStyle: 'outline', ctaStyle: 'glow', featStyle: 'pill' }, bg: { type: 'radial', cx: 0.5, cy: 1 }, d: [{ t: 'neon', c: 'accent', a: 0.9 }, { t: 'grid', c: 'accent2', a: 0.12, persp: true }], fo: ['Orbitron', 'Space Grotesk', 800, true], ft: 'minimal', lg: 'top-center', hl: 'gradient', lh: 1.12 },
    neonCard: { f: 'neon', L: { type: 'card', card: 'neon', align: 'left', tagStyle: 'text', ctaStyle: 'glow', featStyle: 'arrow' }, bg: { type: 'solid' }, d: [{ t: 'halftone', pos: 'tr', c: 'accent2', a: 0.35 }, { t: 'neon', c: 'accent2', a: 0.7, mode: 'corner' }], fo: ['Space Grotesk', 'Inter', 700], ft: 'line', lg: 'top-left', hl: 'accentLast' },
    cleanSplit: { f: 'clean', L: { type: 'split', side: 'right', panel: 'inset', ratio: 0.44, tagStyle: 'soft', ctaStyle: 'solid', featStyle: 'check' }, bg: { type: 'solid' }, d: [{ t: 'dots', pos: 'tl', c: 'accent', a: 0.25 }], fo: ['Poppins', 'Inter', 700], ft: 'stack', lg: 'top-left', hl: 'accentLast' },
    cleanFeatures: { f: 'clean', L: { type: 'features', align: 'left', tagStyle: 'pill', featStyle: 'card', ctaStyle: 'arrow' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'circles', pos: 'tr', c: 'accent', a: 0.08 }], fo: ['Inter', 'Inter', 800], ft: 'bar', lg: 'top-left', hl: 'accentLast' },
    productCircle: { f: 'product', L: { type: 'showcase', mode: 'circle', align: 'center', ctaStyle: 'solid' }, bg: { type: 'radial', cx: 0.5, cy: 0.3 }, d: [{ t: 'rings', pos: 'c', c: 'accent', a: 0.1, n: 7 }], fo: ['Poppins', 'Poppins', 800], ft: 'pills', lg: 'top-center' },
    productPodium: { f: 'product', L: { type: 'showcase', mode: 'podium', align: 'center', ctaStyle: 'arrow' }, bg: { type: 'spotlight', angle: 180 }, d: [{ t: 'sparkles', n: 8, c: 'accent', a: 0.5 }], fo: ['Montserrat', 'Inter', 800], ft: 'line', lg: 'top-center' },
    productTilted: { f: 'product', L: { type: 'showcase', mode: 'tilted', align: 'left', ctaStyle: 'solid' }, bg: { type: 'diagonal' }, d: [{ t: 'dots', pos: 'tl', c: 'accent', a: 0.4 }], fo: ['Outfit', 'Inter', 800], ft: 'line', lg: 'top-left' },
    photoBottom: { f: 'photo', L: { type: 'photo', mode: 'bottom', align: 'left', tagStyle: 'pill', ctaStyle: 'solid' }, bg: { type: 'solid' }, d: [], fo: ['Poppins', 'Inter', 800], ft: 'line', lg: 'top-left' },
    photoFramed: { f: 'photo', L: { type: 'photo', mode: 'framed', align: 'center', tagStyle: 'soft', ctaStyle: 'solid', featStyle: 'pill' }, bg: { type: 'linear', angle: 170 }, d: [{ t: 'confetti', n: 22, a: 0.5 }], fo: ['Outfit', 'Inter', 700], ft: 'pills', lg: 'top-center' },
    photoSide: { f: 'photo', L: { type: 'photo', mode: 'side', align: 'left', tagStyle: 'text', ctaStyle: 'solid' }, bg: { type: 'solid' }, d: [], fo: ['Space Grotesk', 'Inter', 700], ft: 'stack', lg: 'top-left', decorFront: true },
    abstractBlobs: { f: 'abstract', L: { type: 'hero', align: 'center', tagStyle: 'soft', ctaStyle: 'white', featStyle: 'pill' }, bg: { type: 'mesh' }, d: [{ t: 'arcs', c: 'accent', a: 0.4 }, { t: 'circles', pos: 'bl', c: 'accent2', a: 0.18 }], fo: ['Poppins', 'Inter', 800], ft: 'pills', lg: 'top-center' },
    abstractArcs: { f: 'abstract', L: { type: 'hero', align: 'left', valign: 'bottom', tagStyle: 'pill', ctaStyle: 'arrow', divider: 'dots' }, bg: { type: 'linear', angle: 120 }, d: [{ t: 'rings', pos: 'tr', c: 'accent', a: 0.4, n: 6 }, { t: 'halftone', pos: 'tl', c: 'accent2', a: 0.25, size: 0.7 }], fo: ['Outfit', 'Inter', 800], ft: 'line', lg: 'top-left' },
    waveHero: { f: 'abstract', L: { type: 'hero', align: 'center', valign: 'top', tagStyle: 'pill', ctaStyle: 'white', featStyle: 'check' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'waves', c: 'accent', a: 0.35 }, { t: 'bokeh', n: 6, a: 0.15 }], fo: ['Montserrat', 'Inter', 800], ft: 'minimal', lg: 'top-center' },
    festiveMandala: { f: 'festive', L: { type: 'hero', hs: 1.5, align: 'center', tagStyle: 'script', ctaStyle: 'outline', divider: 'diamond' }, bg: { type: 'radial', cx: 0.5, cy: 0.45 }, d: [{ t: 'mandala', pos: 'c', c: 'accent', a: 0.28 }, { t: 'corners', c: 'accent', a: 0.8 }], fo: ['Playfair Display', 'Montserrat', 800], ft: 'minimal', lg: 'bottom-center', lh: 1.05 },
    festiveDiya: { f: 'festive', L: { type: 'hero', hs: 1.6, align: 'center', valign: 'top', tagStyle: 'script', ctaStyle: 'outline', divider: 'diamond' }, bg: { type: 'radial', cx: 0.5, cy: 0.85 }, d: [{ t: 'bokeh', n: 12, c: 'accent', a: 0.35 }, { t: 'mandala', pos: 't', c: 'accent', a: 0.18, size: 0.9 }, { t: 'diyas', n: 5, c: 'accent', a: 1, lift: 3.4 }], fo: ['DM Serif Display', 'Montserrat', 400], ft: 'minimal', lg: 'top-center', hl: 'gradient', lh: 1.05 },
    festiveRangoli: { f: 'festive', L: { type: 'hero', hs: 1.5, align: 'center', tagStyle: 'script', ctaStyle: 'solid', divider: 'dots' }, bg: { type: 'solid' }, d: [{ t: 'rangoli', pos: 'bl', a: 0.85 }, { t: 'rangoli', pos: 'tr', a: 0.85 }, { t: 'bunting', a: 0.9 }], fo: ['Playfair Display', 'Poppins', 800], ft: 'line', lg: 'bottom-center', lh: 1.05 },
    festiveCrescent: { f: 'festive', L: { type: 'hero', hs: 1.4, align: 'center', tagStyle: 'script', ctaStyle: 'outline', divider: 'diamond' }, bg: { type: 'radial', cx: 0.5, cy: 0.2 }, d: [{ t: 'crescent', pos: 'tr', c: 'accent', a: 0.95 }, { t: 'frame', double: true, c: 'accent', a: 0.6 }, { t: 'mandala', pos: 'b', c: 'accent', a: 0.15 }], fo: ['Cormorant Garamond', 'Montserrat', 700], ft: 'minimal', lg: 'bottom-center', hl: 'gradient' },
    festiveFireworks: { f: 'festive', L: { type: 'hero', hs: 1.2, align: 'center', tagStyle: 'pill', ctaStyle: 'glow' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'fireworks', n: 5, c: 'accent', a: 0.8 }, { t: 'sparkles', n: 20, c: 'accent', a: 0.7 }], fo: ['Poppins', 'Inter', 900], ft: 'pills', lg: 'top-center', hl: 'gradient' },
    festiveConfetti: { f: 'festive', L: { type: 'hero', hs: 1.3, align: 'center', tagStyle: 'script', ctaStyle: 'solid', featStyle: 'pill' }, bg: { type: 'linear', angle: 150 }, d: [{ t: 'confetti', n: 60, a: 0.9 }, { t: 'blobs', n: 3, a: 0.3 }], fo: ['Outfit', 'Inter', 900], ft: 'pills', lg: 'bottom-center' },
    inviteFrame: { f: 'invitation', L: { type: 'invite', align: 'center' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'frame', double: true, c: 'accent', a: 0.8 }, { t: 'leaves', c: 'accent', a: 0.25, n: 2 }], fo: ['Playfair Display', 'Raleway', 600], ft: 'minimal', lg: 'top-center', lh: 1.1 },
    inviteArch: { f: 'invitation', L: { type: 'invite', align: 'center', arch: true }, bg: { type: 'solid' }, d: [{ t: 'sparkles', n: 10, c: 'accent', a: 0.5 }], fo: ['Cormorant Garamond', 'Raleway', 700], ft: 'minimal', lg: 'none', lh: 1.05 },
    announceBand: { f: 'announcement', L: { type: 'announce', mode: 'band', align: 'center', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'dots', pos: 'bl', c: 'accent', a: 0.3 }, { t: 'dots', pos: 'tr', c: 'accent', a: 0.3 }], fo: ['Montserrat', 'Inter', 800], ft: 'line', lg: 'top-center' },
    announceBanner: { f: 'announcement', L: { type: 'announce', mode: 'banner', align: 'center', ctaStyle: 'outline', divider: 'dots' }, bg: { type: 'radial', cx: 0.5, cy: 0.5 }, d: [{ t: 'sunburst', pos: 'c', c: 'accent', a: 0.07, n: 32 }], fo: ['Poppins', 'Inter', 800], ft: 'pills', lg: 'top-center' },
    testiCard: { f: 'testimonial', L: { type: 'testimonial', card: 'solid', align: 'left', tagStyle: 'soft' }, bg: { type: 'linear', angle: 140 }, d: [{ t: 'circles', pos: 'tr', c: 'accent2', a: 0.25 }], fo: ['Poppins', 'Inter', 700], ft: 'minimal', lg: 'top-left' },
    testiPlain: { f: 'testimonial', L: { type: 'testimonial', align: 'center', tagStyle: 'text', maxW: 0.9, quoteItalic: true }, bg: { type: 'solid' }, d: [{ t: 'dots', pos: 'tl', c: 'accent', a: 0.25 }, { t: 'dots', pos: 'br', c: 'accent', a: 0.25 }], fo: ['Lora', 'Inter', 600], ft: 'line', lg: 'top-center' },
    testiGlass: { f: 'testimonial', L: { type: 'testimonial', card: 'glass', align: 'center', tagStyle: 'soft' }, bg: { type: 'mesh' }, d: [{ t: 'sparkles', n: 8, c: 'accent', a: 0.5 }], fo: ['Outfit', 'Inter', 600], ft: 'pills', lg: 'top-center' },
    compareTable: { f: 'comparison', L: { type: 'compare', align: 'left', tagStyle: 'soft', ctaStyle: 'arrow' }, bg: { type: 'solid' }, d: [{ t: 'bars', pos: 'br', c: 'accent', a: 0.08 }], fo: ['Inter', 'Inter', 800], ft: 'line', lg: 'top-left', hl: 'accentLast' },
    compareCard: { f: 'comparison', L: { type: 'compare', align: 'center', card: 'glass', tagStyle: 'pill', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 135 }, d: [{ t: 'blobs', n: 2, a: 0.3 }], fo: ['Outfit', 'Inter', 800], ft: 'pills', lg: 'top-center' },
    offerBurst: { f: 'offer', L: { type: 'offer', badge: 'burst', align: 'center', ctaStyle: 'white' }, bg: { type: 'radial', cx: 0.5, cy: 0.3 }, d: [{ t: 'sunburst', pos: 't', c: 'text', a: 0.06, n: 36 }, { t: 'confetti', n: 26, a: 0.55 }], fo: ['Poppins', 'Inter', 900], ft: 'bar-dark', lg: 'top-center', lh: 1.02 },
    offerCircle: { f: 'offer', L: { type: 'offer', badge: 'circle', align: 'left', ctaStyle: 'solid' }, bg: { type: 'solid' }, d: [{ t: 'halftone', pos: 'br', c: 'accent', a: 0.15 }, { t: 'zigzag', pos: 'tr', c: 'accent2', a: 0.7 }], fo: ['Archivo Black', 'Inter', 400, true], ft: 'line', lg: 'top-left', lh: 1.0 },
    offerTicket: { f: 'offer', L: { type: 'offer', badge: 'ticket', align: 'center', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'stripes', pos: 'bl', c: 'accent', a: 0.12 }, { t: 'sparkles', n: 8, c: 'accent', a: 0.6 }], fo: ['Montserrat', 'Inter', 900], ft: 'pills', lg: 'top-center', lh: 1.02 },
    infoTiles: { f: 'infographic', L: { type: 'grid', mode: 'tiles', align: 'center', tagStyle: 'soft', ctaStyle: 'solid' }, bg: { type: 'solid' }, d: [{ t: 'dots', pos: 'tr', c: 'accent', a: 0.25 }], fo: ['Poppins', 'Inter', 700], ft: 'line', lg: 'top-center' },
    infoStats: { f: 'infographic', L: { type: 'grid', mode: 'stats', align: 'left', tagStyle: 'pill', ctaStyle: 'arrow' }, bg: { type: 'linear', angle: 165 }, d: [{ t: 'bars', pos: 'br', c: 'accent', a: 0.15 }, { t: 'grid', c: 'text', a: 0.04 }], fo: ['Space Grotesk', 'Inter', 700], ft: 'line', lg: 'top-left' },
    infoSteps: { f: 'infographic', L: { type: 'steps', align: 'left', tagStyle: 'soft', ctaStyle: 'arrow' }, bg: { type: 'solid' }, d: [{ t: 'circles', pos: 'br', c: 'accent', a: 0.08 }], fo: ['Outfit', 'Inter', 800], ft: 'line', lg: 'top-left', hl: 'accentLast' },
    hiringPills: { f: 'announcement', L: { type: 'hiring', align: 'center', ctaStyle: 'solid', subColor: 'muted' }, bg: { type: 'linear', angle: 160 }, d: [{ t: 'plus', pos: 'tl', c: 'accent', a: 0.4 }, { t: 'rings', pos: 'br', c: 'accent', a: 0.18 }], fo: ['Montserrat', 'Inter', 800], ft: 'line', lg: 'top-center' },
    eventDate: { f: 'announcement', L: { type: 'event', align: 'left', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 150 }, d: [{ t: 'arcs', c: 'accent', a: 0.25 }], fo: ['Outfit', 'Inter', 800], ft: 'line', lg: 'top-right' },
    quoteCenter: { f: 'minimal', L: { type: 'quote', align: 'center', divider: 'line' }, bg: { type: 'solid' }, d: [{ t: 'frame', c: 'accent', a: 0.35 }], fo: ['Playfair Display', 'Inter', 700], ft: 'minimal', lg: 'bottom-center', lh: 1.15, transparentOk: true },
    quoteBar: { f: 'editorial', L: { type: 'quote', align: 'left', bar: true, mark: false, italic: true }, bg: { type: 'linear', angle: 160 }, d: [{ t: 'halftone', pos: 'tr', c: 'accent', a: 0.15 }], fo: ['Lora', 'Inter', 600], ft: 'minimal', lg: 'bottom-left', lh: 1.2 },
    chatMock: { f: 'product', L: { type: 'chat', align: 'left', tagStyle: 'soft', ctaStyle: 'solid' }, bg: { type: 'linear', angle: 160 }, d: [{ t: 'dots', pos: 'tr', c: 'accent', a: 0.3 }, { t: 'glow', pos: 'br', c: 'accent', a: 0.25 }], fo: ['Poppins', 'Inter', 800], ft: 'line', lg: 'top-left' },
    realSkyline: { f: 'photo', L: { type: 'photo', mode: 'bottom', align: 'center', tagStyle: 'ribbon', ctaStyle: 'solid', keys: ['tag', 'headline', 'subheadline', 'features', 'cta'] }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'skyline', c: 'accent', a: 0.25 }], fo: ['Playfair Display', 'Montserrat', 800], ft: 'bar', lg: 'top-center', decorFront: true },
    travelMountains: { f: 'photo', L: { type: 'hero', align: 'center', valign: 'top', tagStyle: 'script', ctaStyle: 'solid', featStyle: 'pill' }, bg: { type: 'linear', angle: 180 }, d: [{ t: 'mountains', c: 'accent', a: 0.9 }, { t: 'circles', pos: 'tr', c: 'accent2', a: 0.35, size: 0.4 }], fo: ['Bebas Neue', 'Poppins', 400, true], ft: 'bar', lg: 'top-left', lh: 0.95 },
    healthCross: { f: 'clean', L: { type: 'features', align: 'left', tagStyle: 'soft', featStyle: 'check', ctaStyle: 'solid' }, bg: { type: 'split' }, d: [{ t: 'cross', n: 6, c: 'accent', a: 0.12 }, { t: 'waves', c: 'accent2', a: 0.12 }], fo: ['Poppins', 'Inter', 700], ft: 'pills', lg: 'top-left', hl: 'accentLast' }
  };

  const t = (tag, headline, subheadline, description, features, cta, footer) => ({ tag, headline, subheadline, description, features: features || [], cta, footer });

  /* n name · c category · r recipe · p palette · z size · x text · b brand · ct default contacts · v overrides · k keywords · hot (featured popularity) */
  const ENTRIES = [
    // ---- Infinitia Hub flagship designs ----
    { n: 'We Build Digital Experiences', c: 'Company Branding', r: 'abstractBlobs', p: 'brand', z: 'ig-portrait', b: 'Infinitia Hub', hot: 99, k: ['agency', 'digital', 'brand'],
      x: t('Digital Studio', 'We Build Digital Experiences', 'Websites · Automation · AI', 'From strategy to launch, we design and build digital products that help businesses connect with their customers.', ['Strategy', 'Design', 'Development'], 'Start Your Project') },
    { n: 'Transform Your Business with AI', c: 'Technology & AI', r: 'neonLines', p: 'neonCyber', z: 'ig-portrait', b: 'Infinitia Hub', hot: 97, k: ['ai', 'artificial intelligence', 'automation'],
      x: t('AI Solutions', 'Transform Your Business with AI', 'Smarter workflows. Better decisions.', 'Put AI to work on the repetitive tasks so your team can focus on customers.', ['Automation', 'Insights', 'Chatbots'], 'Get Started') },
    { n: 'Smart WhatsApp Automation', c: 'WhatsApp Marketing', r: 'chatMock', p: 'peacock', z: 'wa-poster', b: 'Infinitia Hub', ct: ['whatsapp', 'website'], hot: 98, k: ['whatsapp', 'chat', 'automation', 'bot'],
      x: t('WhatsApp Automation', 'Smart WhatsApp Automation', 'Reply, remind and follow up — automatically', '', ['Hi! Is my order ready?', 'Yes! Your order #1024 is packed and ships today.', 'Great, thank you!', 'You’re welcome. Reply TRACK any time for live updates.'], 'Automate My WhatsApp') },
    { n: 'AI Chatbots for Modern Businesses', c: 'Technology & AI', r: 'techFeatures', p: 'matrix', z: 'ig-portrait', b: 'Infinitia Hub', hot: 95, k: ['chatbot', 'ai', 'support'],
      x: t('AI Chatbots', 'AI Chatbots for Modern Businesses', 'Answer customers instantly, day or night', '', ['Handles common questions automatically', 'Hands complex chats to your team', 'Works on your website and WhatsApp', 'Learns from your FAQs and documents'], 'Request a Demo') },
    { n: 'Website Development Services', c: 'Service Promotions', r: 'cleanSplit', p: 'clean', z: 'ig-portrait', b: 'Infinitia Hub', hot: 94, k: ['website', 'web design', 'development'],
      x: t('Web Development', 'Website Development Services', '', 'Beautiful, fast websites that turn visitors into customers.', ['Responsive, mobile-first design', 'SEO-friendly structure', 'Fast, secure hosting setup'], 'Get a Free Quote') },
    { n: 'Digital Marketing Solutions', c: 'Service Promotions', r: 'gradCard', p: 'sunset', z: 'ig-square', b: 'Infinitia Hub', hot: 93, k: ['marketing', 'ads', 'social media'],
      x: t('Digital Marketing', 'Digital Marketing Solutions', '', 'Reach the right audience with campaigns built around your goals.', ['Social media campaigns', 'Search & display ads', 'Content & email marketing'], 'Grow Your Reach') },
    { n: 'Multichannel Customer Engagement', c: 'Business Promotions', r: 'geoHex', p: 'indigo', z: 'ig-portrait', b: 'Infinitia Hub', hot: 90, k: ['omnichannel', 'engagement', 'crm'],
      x: t('Omnichannel', 'Multichannel Customer Engagement', 'One conversation across every channel', '', ['WhatsApp', 'Email', 'SMS', 'Website Chat', 'Social Media', 'Voice'], 'Connect Every Channel'), v: { L: { icons: ['chat', 'mail', 'phone', 'globe', 'users', 'zap'] } } },
    { n: 'Business Automation Made Simple', c: 'Business Promotions', r: 'infoSteps', p: 'softGrey', z: 'linkedin', b: 'Infinitia Hub', hot: 91, k: ['automation', 'workflow', 'process'],
      x: t('Automation', 'Business Automation Made Simple', '', '', ['Map your workflow', 'Automate repetitive tasks', 'Track results in one place'], 'Get Started') },
    { n: 'Your Next Digital Transformation', c: 'Company Branding', r: 'techCircuit', p: 'electric', z: 'linkedin', b: 'Infinitia Hub', hot: 89, k: ['transformation', 'digital', 'enterprise'],
      x: t('Digital Transformation', 'Your Next Digital Transformation Starts Here', '', 'Modernise operations with connected websites, automation and data-driven tools.', ['Process automation', 'Cloud-ready platforms', 'Analytics dashboards'], 'Book a Discovery Call') },
    { n: 'Launch Your Business Online', c: 'Website & App Launches', r: 'productPodium', p: 'indigo', z: 'ig-square', b: 'Infinitia Hub', hot: 92, k: ['launch', 'online store', 'website'],
      x: t('GO LIVE', 'Launch Your Business Online', 'Website + WhatsApp + Payments', '', ['Domain & hosting', 'Online store', 'Payment links'], 'Launch Today') },
    { n: 'Meet AI Studio Craft', c: 'Product Promotions', r: 'productCircle', p: 'brand', z: 'ig-portrait', b: 'AI Studio Craft', hot: 96, k: ['ai studio craft', 'product', 'ai tool'],
      x: t('NEW', 'Meet AI Studio Craft', 'Your creative AI workspace', 'Turn ideas into polished content and designs in minutes.', ['Generate ideas', 'Design faster', 'Collaborate'], 'Explore AI Studio Craft') },
    { n: 'Technology That Moves Business Forward', c: 'Company Branding', r: 'editorialRule', p: 'paper', z: 'ig-portrait', b: 'Infinitia Hub', hot: 86, k: ['technology', 'company', 'about'],
      x: t('Infinitia Hub', 'Technology That Moves Business Forward', 'Practical digital solutions for growing teams', 'We combine design, engineering and automation to help businesses work smarter and serve customers better.', ['Websites & web apps', 'WhatsApp & chat automation', 'AI-powered workflows'], 'Learn more') },
    { n: 'WhatsApp Business API Solutions', c: 'WhatsApp Marketing', r: 'cleanFeatures', p: 'mint', z: 'ig-portrait', b: 'Infinitia Hub', ct: ['whatsapp', 'website'], hot: 94, k: ['whatsapp api', 'broadcast', 'business'],
      x: t('WhatsApp Business API', 'WhatsApp Business API Solutions', '', '', ['Template messages & broadcasts', 'Shared team inbox', 'Chatbot & CRM integration', 'Delivery & read reports'], 'Get Set Up') },
    { n: 'Customer Support Automation', c: 'Service Promotions', r: 'glassFeatures', p: 'aurora', z: 'ig-portrait', b: 'Infinitia Hub', hot: 88, k: ['support', 'helpdesk', 'automation'],
      x: t('Support Automation', 'Customer Support Automation', 'Faster answers, happier customers', '', ['Instant answers to FAQs', 'Smart ticket routing', 'Multilingual replies', 'Satisfaction surveys'], 'Automate Support') },
    { n: 'Build Smarter. Grow Faster.', c: 'Instagram Posts', r: 'boldStack', p: 'brand', z: 'ig-portrait', b: 'Infinitia Hub', hot: 92, k: ['growth', 'motivation', 'brand'],
      x: t('Infinitia Hub', 'Build Smarter. Grow Faster.', 'Digital tools for ambitious businesses', '', [], 'Let’s Talk') },
    { n: 'New Product Announcement', c: 'Business Announcements', r: 'announceBand', p: 'clean', z: 'ig-portrait', b: 'Infinitia Hub', hot: 87, k: ['announcement', 'launch', 'product'],
      x: t('Announcement', 'Introducing Our Newest Product', 'Available from 1 December', 'Designed to save you time and keep your customers happy. Ask us for an early demo.', [], 'Learn More') },
    { n: 'Special Business Offer', c: 'Offers & Discounts', r: 'offerBurst', p: 'redOffer', z: 'wa-poster', b: 'Infinitia Hub', hot: 95, k: ['offer', 'discount', 'sale'],
      x: t('20% OFF', 'Special Business Offer', 'On website & automation packages', 'Valid for new projects booked this month.', [], 'Claim Offer', '*Terms apply. Edit this line with your offer details.') },
    { n: 'Client Testimonial', c: 'Testimonials', r: 'testiCard', p: 'brand', z: 'ig-portrait', b: 'Infinitia Hub', hot: 90, k: ['testimonial', 'review', 'client'],
      x: t('Client Testimonial', 'What Our Clients Say', 'Client Name, Company Name', 'Working with the team was smooth from start to finish. Our new website and WhatsApp automation save us hours every week.', [], '') },
    { n: 'Our Services at a Glance', c: 'Company Branding', r: 'infoTiles', p: 'clean', z: 'ig-square', b: 'Infinitia Hub', hot: 93, k: ['services', 'overview', 'what we do'],
      x: t('What We Do', 'Our Services at a Glance', '', '', ['Website Development', 'WhatsApp Automation', 'AI Chatbots', 'Digital Marketing', 'Business Automation', 'Support Tools'], 'Explore Services'), v: { L: { icons: ['globe', 'chat', 'cpu', 'trend', 'zap', 'users'] } } },
    { n: 'Let’s Build Something Great', c: 'Instagram Posts', r: 'abstractBlobs', p: 'coral', z: 'ig-square', b: 'Infinitia Hub', hot: 91, k: ['contact', 'collaboration', 'cta'],
      x: t('Let’s Talk', 'Let’s Build Something Great', 'Tell us about your idea', '', [], 'Contact Us'), v: { L: { align: 'left', valign: 'bottom' }, d: [{ t: 'arcs', c: 'text', a: 0.3 }, { t: 'circles', pos: 'tr', c: 'accent2', a: 0.25 }, { t: 'dots', pos: 'tl', c: 'text', a: 0.4 }], lg: 'top-left' } },

    // ---- Company Branding ----
    { n: 'Who We Are', c: 'Company Branding', r: 'minimalLeft', p: 'softGrey', z: 'ig-portrait', b: 'Infinitia Hub', k: ['about us', 'company', 'team'],
      x: t('About Us', 'Who We Are', 'A digital studio focused on useful technology', 'We help businesses simplify work, reach customers and grow online with thoughtful design and engineering.', [], 'Meet the Team') },
    { n: 'Built With Care', c: 'Company Branding', r: 'luxCenter', p: 'navyGold', z: 'ig-square', b: 'Infinitia Hub', k: ['promise', 'values', 'quality'],
      x: t('Our Promise', 'Built With Care. Delivered With Clarity.', '', 'Clear communication, honest timelines and work we are proud to put our name on.', [], 'Work With Us') },

    // ---- Technology & AI ----
    { n: 'The Future Is Automated', c: 'Technology & AI', r: 'boldGiant', p: 'ink', z: 'ig-square', k: ['automation', 'future', 'robotics'],
      x: t('Automation', 'The Future Is Automated', 'Let software handle the busywork', '', [], 'Discover How'), v: { d: [{ t: 'bigtext', text: 'AI', pos: 'r', a: 0.08 }] } },
    { n: 'Create Faster with AI', c: 'Technology & AI', r: 'glassCard', p: 'grape', z: 'story', b: 'AI Studio Craft', k: ['ai studio craft', 'creative', 'content'],
      x: t('AI Studio Craft', 'Create Faster with AI', 'Ideas to visuals in minutes', '', ['Content ideas on demand', 'Design drafts in seconds', 'Copy suggestions that fit your brand'], 'Try AI Studio Craft') },
    { n: 'Make Data-Driven Decisions', c: 'Technology & AI', r: 'infoStats', p: 'slate', z: 'facebook', k: ['analytics', 'data', 'dashboard'],
      x: t('Analytics', 'Make Data-Driven Decisions', '', '', ['24/7 | Live dashboards', '360° | Customer view', '1-click | Reports'], 'See a Sample') },
    { n: 'Machine Learning, Made Practical', c: 'Technology & AI', r: 'techOrbit', p: 'night', z: 'ig-portrait', k: ['machine learning', 'ml', 'ai'],
      x: t('AI', 'Machine Learning, Made Practical', 'Real use-cases, real workflows', '', ['Forecasting', 'Recommendations', 'Document AI'], 'Talk to an Expert') },

    // ---- WhatsApp Marketing ----
    { n: 'Reach Customers Where They Chat', c: 'WhatsApp Marketing', r: 'gradDiagonal', p: 'ocean', z: 'story', ct: ['whatsapp', 'website'], k: ['whatsapp', 'reach', 'customers'],
      x: t('WhatsApp Marketing', 'Reach Customers Where They Chat', 'Personal, timely and opt-in', 'Send updates, offers and reminders to customers who choose to hear from you.', [], 'Message Us') },
    { n: 'Broadcast Offers Instantly', c: 'WhatsApp Marketing', r: 'boldStack', p: 'forest', z: 'ig-square', ct: ['whatsapp'], k: ['broadcast', 'whatsapp', 'offers'],
      x: t('Broadcasts', 'Broadcast Offers Instantly', 'Personalised updates for opted-in customers', '', [], 'Start Broadcasting'), v: { L: { align: 'center', mode: 'wrap', fillMax: 1.4 }, d: [{ t: 'sparkles', n: 12, c: 'accent', a: 0.8 }, { t: 'rings', pos: 'bl', c: 'accent', a: 0.2 }], lg: 'top-center' } },
    { n: 'Order Updates on WhatsApp', c: 'WhatsApp Marketing', r: 'chatMock', p: 'softGrey', z: 'facebook', ct: ['whatsapp', 'website'], k: ['order', 'notifications', 'ecommerce'],
      x: t('Order Alerts', 'Order Updates on WhatsApp', 'Confirmations, shipping and delivery alerts', '', ['Where is my order?', 'Your order has shipped and arrives tomorrow.', 'Can I change the address?', 'Sure! Reply with the new address and we’ll update it.'], 'Enable Alerts'), v: { d: [{ t: 'circles', pos: 'bl', c: 'accent', a: 0.08 }], ft: 'minimal' } },
    { n: 'Chat With Us on WhatsApp', c: 'WhatsApp Marketing', r: 'neonCard', p: 'neonLime', z: 'story', ct: ['whatsapp'], k: ['contact', 'whatsapp', 'support'],
      x: t('We’re on WhatsApp', 'Chat With Us on WhatsApp', '', 'Questions, quotes or support — message us any time.', ['Quick replies', 'Easy ordering', 'Friendly support'], 'Tap to Chat') },

    // ---- Service Promotions ----
    { n: 'SEO That Helps You Get Found', c: 'Service Promotions', r: 'geoTriangles', p: 'yellow', z: 'ig-square', k: ['seo', 'search', 'google'],
      x: t('SEO Services', 'SEO That Helps You Get Found', '', '', ['Keyword research', 'On-page optimisation', 'Local SEO', 'Monthly reporting'], 'Get an SEO Audit') },
    { n: 'Social Media Management', c: 'Service Promotions', r: 'photoFramed', p: 'lavender', z: 'ig-portrait', k: ['social media', 'instagram', 'content'],
      x: t('Social Media', 'Social Media Management', 'Consistent content, engaged followers', '', ['Content calendar', 'Reels & posts', 'Community replies'], 'Plan My Content') },
    { n: 'Mobile App Development', c: 'Service Promotions', r: 'productTilted', p: 'royal', z: 'linkedin', k: ['mobile app', 'ios', 'android'],
      x: t('iOS & Android', 'Mobile App Development', 'From idea to app store', '', ['Native & cross-platform', 'UI/UX design', 'Launch support'], 'Discuss Your App') },

    // ---- Business Promotions ----
    { n: 'Grow Your Local Business', c: 'Business Promotions', r: 'waveHero', p: 'ocean', z: 'ig-portrait', k: ['local', 'small business', 'growth'],
      x: t('Local Growth', 'Grow Your Local Business', 'Get found by customers nearby', '', ['Google Business Profile setup', 'Local ads', 'Review management'], 'Let’s Grow') },
    { n: 'Why Choose Automation', c: 'Business Promotions', r: 'compareTable', p: 'clean', z: 'ig-portrait', k: ['comparison', 'why choose us', 'automation'],
      x: t('Why Choose Us', 'Work Smarter With Automation', 'Traditional vs With Automation', '', ['Manual follow-ups | Automatic reminders', 'Missed after-hours leads | Instant 24/7 replies', 'Scattered data | One shared dashboard', 'Slow reporting | Real-time insights'], 'Make the Switch') },
    { n: 'Book a Free Consultation', c: 'Business Promotions', r: 'cardOffset', p: 'peach', z: 'ig-square', k: ['consultation', 'meeting', 'booking'],
      x: t('Free Consultation', 'Book a Free Consultation', '', 'Tell us about your goals and we’ll suggest a practical plan.', ['30-minute call', 'Personalised plan', 'No obligation'], 'Book Now') },
    { n: 'Small Business. Big Impact.', c: 'Business Promotions', r: 'boldOutline', p: 'charcoal', z: 'story', k: ['small business', 'impact', 'bold'],
      x: t('For Small Businesses', 'Small Business. Big Impact.', 'Affordable digital tools that grow with you', '', [], 'Get Started') },

    // ---- Website & App Launches ----
    { n: 'Our New Website Is Live', c: 'Website & App Launches', r: 'minimalHero', p: 'indigo', z: 'facebook', k: ['website launch', 'live', 'new site'],
      x: t('It’s Live', 'Our New Website Is Live', '', 'Explore our services, see recent work and get in touch faster.', [], 'Visit Now') },
    { n: 'Download Our App', c: 'Website & App Launches', r: 'productCircle', p: 'electric', z: 'story', k: ['app', 'download', 'mobile'],
      x: t('FREE', 'Download Our App', 'Everything you need, in your pocket', '', ['Fast checkout', 'Order tracking', 'Exclusive deals'], 'Get the App'), v: { d: [{ t: 'orbits', pos: 'c', c: 'accent', a: 0.2, size: 1.1 }, { t: 'dots', pos: 'bl', c: 'accent', a: 0.3 }], ft: 'line' } },
    { n: 'Something New Is Coming', c: 'Website & App Launches', r: 'abstractArcs', p: 'grape', z: 'ig-portrait', k: ['coming soon', 'teaser', 'launch'],
      x: t('Coming Soon', 'Something New Is Coming', 'Launching this season', 'Be the first to know when we go live.', [], 'Join the Waitlist') },
    { n: 'Version 2.0 Is Here', c: 'Website & App Launches', r: 'boldGiant', p: 'yellow', z: 'ig-square', k: ['update', 'release', 'version'],
      x: t('Update', 'Version 2.0 Is Here', 'Faster, simpler and more powerful', '', [], 'See What’s New'), v: { d: [{ t: 'bigtext', text: '2.0', len: 3, pos: 'r', a: 0.12 }], L: { tagStyle: 'pill' }, ft: 'line' } },
    { n: 'Beta Access Now Open', c: 'Website & App Launches', r: 'glassCard', p: 'electric', z: 'facebook', k: ['beta', 'early access', 'waitlist'],
      x: t('Beta', 'Beta Access Now Open', '', 'Try new features early and help shape the product.', ['Free during beta', 'Priority support'], 'Request Access'), v: { L: { align: 'left', maxW: 0.7 }, lg: 'top-left', ft: 'line' } },

    // ---- Product Promotions ----
    { n: 'Introducing Smart CRM', c: 'Product Promotions', r: 'cleanSplit', p: 'steel', z: 'linkedin', k: ['crm', 'sales', 'software'],
      x: t('New Product', 'Introducing Smart CRM', '', 'Track every lead and conversation in one simple place.', ['Lead pipeline', 'WhatsApp inbox', 'Sales reports'], 'Book a Demo'), v: { L: { side: 'left', panel: 'circle' } } },
    { n: 'The All-in-One Dashboard', c: 'Product Promotions', r: 'productTilted', p: 'slate', z: 'ig-portrait', k: ['dashboard', 'saas', 'software'],
      x: t('SaaS', 'The All-in-One Dashboard', 'Sales, support and marketing together', '', ['Real-time metrics', 'Team roles', 'Exports'], 'Start Free Trial'), v: { L: { align: 'center' }, d: [{ t: 'grid', c: 'accent', a: 0.06 }], lg: 'top-center' } },
    { n: 'Meet the New Collection', c: 'Product Promotions', r: 'photoBottom', p: 'charcoal', z: 'ig-portrait', k: ['new arrival', 'collection', 'fashion'],
      x: t('New Arrival', 'Meet the New Collection', 'Fresh styles, made to last', '', [], 'Shop Now') },
    { n: 'Designed for Teams', c: 'Product Promotions', r: 'productPodium', p: 'lavender', z: 'ig-square', b: 'AI Studio Craft', k: ['teams', 'collaboration', 'product'],
      x: t('TEAMS', 'Designed for Teams', 'Shared workspaces in AI Studio Craft', '', ['Shared brand kits', 'Comments', 'Roles'], 'Invite Your Team'), v: { d: [{ t: 'blobs', n: 3, a: 0.25 }], ft: 'pills' } },
    { n: 'Product of the Month', c: 'Product Promotions', r: 'luxSplit', p: 'goldNoir', z: 'ig-portrait', k: ['featured', 'luxury', 'product'],
      x: t('Product of the Month', 'Crafted for Excellence', 'Limited edition', 'Discover the piece everyone is talking about this month.', [], 'Discover More') },

    // ---- Instagram Posts ----
    { n: '3 Ways to Save Time', c: 'Instagram Posts', r: 'infoSteps', p: 'sand', z: 'ig-portrait', k: ['tips', 'carousel', 'education'],
      x: t('Tips Tuesday', '3 Ways to Save Time Every Week', '', '', ['Automate appointment reminders', 'Use saved replies for FAQs', 'Review one weekly dashboard'], 'Save This Post'), v: { L: { align: 'center' }, d: [{ t: 'dots', pos: 'tr', c: 'accent', a: 0.35 }, { t: 'dots', pos: 'bl', c: 'accent', a: 0.35 }], lg: 'top-center' } },
    { n: 'Behind the Scenes', c: 'Instagram Posts', r: 'photoSide', p: 'night', z: 'ig-portrait', k: ['behind the scenes', 'team', 'culture'],
      x: t('Studio Diaries', 'Behind the Scenes', '', 'A look at how our team plans, designs and ships projects every week.', [], 'Follow for More') },
    { n: 'Digital Growth 101', c: 'Instagram Posts', r: 'editorialBoxed', p: 'cream', z: 'ig-portrait', k: ['guide', 'carousel', 'swipe'],
      x: t('Guide', 'Digital Growth 101', 'Swipe to learn more', 'Five simple habits that help small businesses grow online.', ['Post consistently', 'Reply fast', 'Measure what matters'], 'Swipe to Learn') },
    { n: 'Ask Us Anything', c: 'Instagram Posts', r: 'gradHero', p: 'holi', z: 'ig-square', k: ['q&a', 'engagement', 'questions'],
      x: t('Q&A', 'Ask Us Anything', 'Drop your questions in the comments', '', ['Websites', 'WhatsApp', 'AI tools'], 'Comment Below') },

    // ---- Business Announcements ----
    { n: 'We’ve Moved', c: 'Business Announcements', r: 'announceBanner', p: 'mint', z: 'ig-square', ct: ['phone', 'website'], k: ['moved', 'new address', 'relocation'],
      x: t('We’ve Moved', 'New Address, Same Great Service', 'From 1 January', 'Visit us at: Your Street Name, Your City', [], 'Get Directions') },
    { n: 'Holiday Office Hours', c: 'Business Announcements', r: 'minimalLeft', p: 'cream', z: 'ig-portrait', ct: ['phone'], k: ['holiday', 'hours', 'notice'],
      x: t('Notice', 'Holiday Office Hours', '', '', ['24 Dec: 9 AM – 1 PM', '25 Dec: Closed', '26 Dec: Regular hours'], ''), v: { d: [{ t: 'leaves', c: 'accent', a: 0.2, n: 2 }], lg: 'top-right', L: { featStyle: 'icons', icons: ['clock', 'calendar', 'clock'] } } },
    { n: 'We’re Now Open', c: 'Business Announcements', r: 'announceBanner', p: 'sunset', z: 'story', ct: ['phone', 'website'], k: ['grand opening', 'now open', 'store'],
      x: t('Now Open', 'Doors Open This Saturday', 'Opening day: 10 AM onwards', 'Come say hello — refreshments for early visitors.', [], 'Visit Us'), v: { d: [{ t: 'confetti', n: 50, a: 0.85 }], ft: 'line' } },
    { n: 'Exciting News', c: 'Business Announcements', r: 'abstractArcs', p: 'royal', z: 'linkedin', k: ['news', 'update', 'company'],
      x: t('Big News', 'Exciting News to Share', '', 'We’re expanding our services to help more businesses grow. Details coming soon.', [], 'Stay Tuned'), v: { L: { valign: 'center' }, d: [{ t: 'rings', pos: 'r', c: 'accent', a: 0.35, n: 6 }, { t: 'sparkles', n: 8, c: 'accent', a: 0.6 }] } },
    { n: 'Thank You for Your Trust', c: 'Business Announcements', r: 'infoStats', p: 'brand', z: 'ig-square', k: ['milestone', 'thank you', 'stats'],
      x: t('Milestone', 'Thank You for Your Trust', '', '', ['1,000+ | Happy customers', '5 | Years of growth', '50+ | Projects delivered'], ''), v: { L: { align: 'center', tileSolid: false }, lg: 'top-center', d: [{ t: 'confetti', n: 30, a: 0.6 }] } },

    // ---- Offers & Discounts ----
    { n: 'Flat 50% Off', c: 'Offers & Discounts', r: 'offerCircle', p: 'yellow', z: 'ig-square', k: ['sale', '50% off', 'discount'],
      x: t('50% OFF', 'Flat 50% Off', 'This weekend only', '', [], 'Shop Now', '*T&C apply') },
    { n: 'Festive Sale', c: 'Offers & Discounts', r: 'offerBurst', p: 'maroon', z: 'ig-portrait', k: ['festive sale', 'diwali sale', 'offer'],
      x: t('UP TO 40% OFF', 'Festive Sale', 'Celebrate with special prices', '', [], 'Shop the Sale', '*Offer valid till stocks last'), v: { d: [{ t: 'mandala', pos: 't', c: 'accent', a: 0.18 }, { t: 'sparkles', n: 18, c: 'accent', a: 0.8 }], ft: 'line' } },
    { n: 'Buy 1 Get 1', c: 'Offers & Discounts', r: 'offerTicket', p: 'charcoal', z: 'ig-square', k: ['bogo', 'buy one get one', 'deal'],
      x: t('BUY 1 GET 1', 'Double the Joy', 'On selected items', '', [], 'Grab the Deal', '*Selected items only') },
    { n: 'Limited Time Deal', c: 'Offers & Discounts', r: 'offerTicket', p: 'electric', z: 'story', k: ['limited', 'deal', 'flash sale'],
      x: t('SAVE ₹500', 'Limited Time Deal', 'Ends Sunday midnight', 'Use code SAVE500 at checkout.', [], 'Grab the Deal'), v: { d: [{ t: 'glow', pos: 'c', c: 'accent', a: 0.3 }, { t: 'circuit', n: 6, c: 'accent', a: 0.3 }], ft: 'line' } },
    { n: 'Early Bird Pricing', c: 'Offers & Discounts', r: 'offerCircle', p: 'mint', z: 'facebook', k: ['early bird', 'pricing', 'discount'],
      x: t('EARLY BIRD 30%', 'Early Bird Pricing', 'For the first 50 sign-ups', '', [], 'Reserve Your Spot'), v: { d: [{ t: 'dots', pos: 'tl', c: 'accent', a: 0.3 }], L: { align: 'left' } } },

    // ---- Testimonials ----
    { n: 'Customer Review', c: 'Testimonials', r: 'testiPlain', p: 'clean', z: 'ig-square', k: ['review', 'feedback', 'quote'],
      x: t('Customer Review', '', 'Customer Name, City', 'Fast, friendly and genuinely helpful. They understood exactly what our business needed.', [], '') },
    { n: '5-Star Experience', c: 'Testimonials', r: 'testiGlass', p: 'aurora', z: 'ig-portrait', k: ['5 star', 'rating', 'review'],
      x: t('5-Star Experience', 'Loved by Our Customers', 'Customer Name, Business Owner', 'The automation set-up was simple and the support team is always quick to respond.', [], '') },
    { n: 'Customer Story', c: 'Testimonials', r: 'testiCard', p: 'peach', z: 'facebook', k: ['case study', 'story', 'testimonial'],
      x: t('Customer Story', 'How We Helped a Local Business', 'Client Name, Founder', 'We now reply to every enquiry within minutes, even on weekends.', [], ''), v: { L: { card: 'tint', align: 'left' }, d: [{ t: 'halftone', pos: 'br', c: 'accent', a: 0.2 }] } },
    { n: 'Loved by Businesses', c: 'Testimonials', r: 'quoteBar', p: 'slate', z: 'ig-square', k: ['quote', 'testimonial', 'review'],
      x: t('', 'They made going digital feel easy.', '— Client Name, Business Owner', '', [], '') },
    { n: 'Review Spotlight', c: 'Testimonials', r: 'testiPlain', p: 'goldNoir', z: 'story', k: ['spotlight', 'luxury', 'review'],
      x: t('Review Spotlight', 'A Truly Premium Experience', 'Client Name, Company', 'Attention to detail at every step. Highly recommended for any business that wants to look its best online.', [], ''), v: { d: [{ t: 'frame', double: true, c: 'accent', a: 0.7 }, { t: 'sparkles', n: 10, c: 'accent', a: 0.6 }], L: { quoteItalic: true, align: 'center', maxW: 0.92 } } },

    // ---- Hiring & Careers ----
    { n: 'We’re Hiring', c: 'Hiring & Careers', r: 'hiringPills', p: 'brand', z: 'ig-portrait', ct: ['website'], k: ['hiring', 'jobs', 'careers'],
      x: t('We’re Hiring', 'Join Our Growing Team', 'Send your CV to careers@yourcompany.com', 'Open roles:', ['Frontend Developer', 'UI/UX Designer', 'Sales Executive', 'Content Writer'], 'Apply Now') },
    { n: 'Join Our Team', c: 'Hiring & Careers', r: 'hiringPills', p: 'clean', z: 'ig-square', ct: ['website'], k: ['join us', 'recruitment', 'careers'],
      x: t('Join Us', 'Build the Future With Us', 'Apply at yourwebsite.com/careers', '', ['Remote-friendly', 'Learning budget', 'Flexible hours'], 'See Open Roles'), v: { L: { align: 'left', pillSolid: true }, lg: 'top-left', d: [{ t: 'squares', pos: 'br', c: 'accent', a: 0.3 }] } },
    { n: 'Internship Opportunities', c: 'Hiring & Careers', r: 'cleanFeatures', p: 'sky', z: 'ig-portrait', k: ['internship', 'students', 'graduates'],
      x: t('Internships', 'Internship Opportunities', '', '', ['3–6 month programmes', 'Mentorship from senior staff', 'Certificate on completion', 'Possible full-time offer'], 'Apply by 30 Nov'), v: { d: [{ t: 'circles', pos: 'tr', c: 'accent', a: 0.1 }, { t: 'plus', pos: 'bl', c: 'accent', a: 0.4 }], ft: 'line' } },
    { n: 'Developers Wanted', c: 'Hiring & Careers', r: 'techCircuit', p: 'matrix', z: 'ig-square', k: ['developers', 'tech jobs', 'engineering'],
      x: t('Now Hiring', 'Developers Wanted', '', 'Help us build automation and AI products used by real businesses.', ['React / Node.js', 'Python & AI', 'Mobile apps'], 'Apply Now'), v: { L: { featStyle: 'arrow' }, d: [{ t: 'circuit', n: 9, c: 'accent', a: 0.4 }, { t: 'bars', pos: 'br', c: 'accent', a: 0.15 }] } },
    { n: 'Careers at Infinitia Hub', c: 'Hiring & Careers', r: 'photoSide', p: 'indigo', z: 'linkedin', b: 'Infinitia Hub', k: ['careers', 'culture', 'employer'],
      x: t('Careers', 'Grow Your Career With Us', '', 'Work on meaningful digital projects with a supportive, curious team.', [], 'View Openings'), v: { d: [{ t: 'dots', pos: 'bl', c: 'accent', a: 0.3 }], ft: 'line' } },
    { n: 'Walk-in Interview', c: 'Hiring & Careers', r: 'eventDate', p: 'peach', z: 'ig-portrait', ct: ['phone'], k: ['walk-in', 'interview', 'recruitment'],
      x: t('15 NOV', 'Walk-in Interview', 'Customer Support Executives', '', ['Saturday, 15 November', '10:00 AM – 4:00 PM', 'Your Office Address, City'], 'Bring Your Resume') },

    // ---- Educational Promotions ----
    { n: 'Admissions Open', c: 'Educational Promotions', r: 'announceBand', p: 'navyGold', z: 'a4', ct: ['phone', 'website'], k: ['admissions', 'school', 'college'],
      x: t('Admissions Open', 'Admissions Open 2026–27', 'Limited seats available', 'Apply now for the new academic year.', ['Experienced faculty', 'Smart classrooms', 'Scholarships available'], 'Enquire Now'), v: { d: [{ t: 'corners', c: 'accent', a: 0.8 }], L: { featStyle: 'check' } } },
    { n: 'Learn Digital Marketing', c: 'Educational Promotions', r: 'geoSquares', p: 'olive', z: 'ig-portrait', k: ['course', 'marketing', 'training'],
      x: t('8-Week Course', 'Learn Digital Marketing', '', '', ['SEO & content', 'Social media ads', 'Analytics', 'Live projects'], 'Enroll Now') },
    { n: 'Free Webinar', c: 'Educational Promotions', r: 'eventDate', p: 'royal', z: 'facebook', k: ['webinar', 'online event', 'free'],
      x: t('28 NOV', 'Free Webinar: Grow With WhatsApp', 'Live online session', '', ['Thursday, 28 November', '6:00 PM – 7:00 PM IST', 'Online — link on registration'], 'Register Free'), v: { d: [{ t: 'glow', pos: 'tr', c: 'accent', a: 0.35 }, { t: 'grid', c: 'accent', a: 0.05 }] } },
    { n: 'Coding Bootcamp', c: 'Educational Promotions', r: 'neonCard', p: 'electric', z: 'ig-portrait', k: ['coding', 'bootcamp', 'programming'],
      x: t('Bootcamp', 'Learn to Code in 12 Weeks', '', 'Hands-on training with real projects and mentor support.', ['HTML, CSS & JavaScript', 'React & Node.js', 'Portfolio projects'], 'Apply Now'), v: { L: { card: 'glass' }, d: [{ t: 'circuit', n: 6, c: 'accent', a: 0.3 }] } },
    { n: 'Exam Prep Classes', c: 'Educational Promotions', r: 'infoTiles', p: 'yellow', z: 'ig-portrait', ct: ['phone'], k: ['tuition', 'exam', 'coaching'],
      x: t('Coaching', 'Exam Prep Classes', 'New batches starting soon', '', ['Small batches', 'Weekly tests', 'Doubt sessions', 'Study material'], 'Book a Demo Class'), v: { L: { tileSolid: true }, d: [{ t: 'zigzag', pos: 'tr', c: 'accent', a: 0.6 }] } },
    { n: 'Workshop: AI for Beginners', c: 'Educational Promotions', r: 'infoSteps', p: 'lavender', z: 'ig-square', k: ['workshop', 'ai', 'learning'],
      x: t('Workshop', 'AI for Beginners', 'A practical, no-jargon introduction', '', ['What AI can do for you', 'Hands-on with real tools', 'Build your first workflow'], 'Save Your Seat'), v: { d: [{ t: 'sparkles', n: 10, c: 'accent', a: 0.5 }, { t: 'circles', pos: 'tr', c: 'accent', a: 0.1 }] } },

    // ---- Real Estate ----
    { n: 'Your Dream Home Awaits', c: 'Real Estate', r: 'realSkyline', p: 'navyGold', z: 'ig-portrait', ct: ['phone', 'website'], k: ['apartments', 'home', 'property'],
      x: t('Now Selling', 'Your Dream Home Awaits', '2 & 3 BHK apartments', '', ['Gated community', 'Clubhouse', 'Near metro'], 'Book a Site Visit') },
    { n: 'Luxury Apartments', c: 'Real Estate', r: 'luxSplit', p: 'champagne', z: 'ig-portrait', ct: ['phone'], k: ['luxury', 'apartments', 'premium'],
      x: t('Luxury Living', 'Refined Homes for Modern Living', '', 'Spacious residences with premium finishes.', ['Private balconies', 'Rooftop lounge', '24/7 security'], 'Schedule a Tour'), v: { L: { panel: 'full', side: 'right' }, d: [{ t: 'corners', c: 'accent', a: 0.7 }] } },
    { n: 'Open House This Weekend', c: 'Real Estate', r: 'eventDate', p: 'sky', z: 'ig-square', ct: ['phone'], k: ['open house', 'viewing', 'property'],
      x: t('SAT 22', 'Open House This Weekend', '', '', ['Saturday & Sunday', '11:00 AM – 5:00 PM', 'Property Address, City'], 'RSVP Now'), v: { L: { align: 'center' }, d: [{ t: 'skyline', c: 'accent', a: 0.12, size: 0.8 }], lg: 'top-center' } },
    { n: 'Commercial Spaces for Lease', c: 'Real Estate', r: 'photoSide', p: 'slate', z: 'facebook', ct: ['phone'], k: ['commercial', 'office space', 'lease'],
      x: t('For Lease', 'Commercial Spaces for Lease', '', 'Ready-to-move offices in a prime business district.', ['500 – 5,000 sq ft', 'Ample parking'], 'Enquire Today'), v: { d: [{ t: 'skyline', c: 'accent', a: 0.15 }] } },
    { n: 'Plots Available', c: 'Real Estate', r: 'geoHex', p: 'olive', z: 'ig-portrait', ct: ['phone'], k: ['plots', 'land', 'investment'],
      x: t('Residential Plots', 'Plots Available Now', 'Approved layout · Clear titles', '', ['1,200 | sq ft onwards', '30 ft | Wide roads', '24/7 | Security', '5 min | To highway'], 'Book a Visit'), v: { L: { mode: 'stats' }, d: [{ t: 'leaves', c: 'accent', a: 0.2, n: 2 }] } },
    { n: 'Just Sold', c: 'Real Estate', r: 'boldStack', p: 'paper', z: 'ig-square', ct: ['phone'], k: ['sold', 'agent', 'property'],
      x: t('Property Update', 'Just Sold!', 'Thinking of selling? Let’s talk.', '', [], 'Get a Free Valuation'), v: { d: [{ t: 'stripes', pos: 'br', c: 'accent', a: 0.3 }], L: { valign: 'bottom' } } },

    // ---- Healthcare ----
    { n: 'Your Health, Our Priority', c: 'Healthcare', r: 'healthCross', p: 'medical', z: 'ig-portrait', ct: ['phone', 'website'], k: ['clinic', 'hospital', 'health'],
      x: t('Healthcare', 'Your Health, Our Priority', '', 'Compassionate care for every member of your family.', ['General consultation', 'Diagnostics', 'Online appointments'], 'Book Appointment') },
    { n: 'Free Health Check-up Camp', c: 'Healthcare', r: 'eventDate', p: 'mint', z: 'ig-portrait', ct: ['phone'], k: ['health camp', 'free check-up', 'community'],
      x: t('7 DEC', 'Free Health Check-up Camp', 'BP · Sugar · BMI · Eye check', '', ['Sunday, 7 December', '9:00 AM – 2:00 PM', 'Community Hall, Your City'], 'Register Now'), v: { d: [{ t: 'cross', n: 5, c: 'accent', a: 0.12 }], L: { align: 'center' }, lg: 'top-center' } },
    { n: 'Book a Doctor Appointment', c: 'Healthcare', r: 'cleanSplit', p: 'medical', z: 'linkedin', ct: ['phone', 'website'], k: ['doctor', 'appointment', 'clinic'],
      x: t('Online Booking', 'Book a Doctor Appointment', '', 'Skip the queue — book online in under a minute.', ['Choose your doctor', 'Pick a time slot', 'Get reminders'], 'Book Now'), v: { L: { panel: 'full' }, d: [{ t: 'cross', n: 4, c: 'accent', a: 0.1 }] } },
    { n: 'Dental Care for the Family', c: 'Healthcare', r: 'productCircle', p: 'sky', z: 'ig-square', ct: ['phone'], k: ['dental', 'dentist', 'smile'],
      x: t('Family', 'Dental Care for the Whole Family', 'Gentle, modern treatments', '', ['Check-ups', 'Cleaning', 'Braces'], 'Book a Check-up'), v: { d: [{ t: 'bokeh', n: 8, c: 'accent', a: 0.2 }], ft: 'line' } },
    { n: 'Mental Wellness Matters', c: 'Healthcare', r: 'waveHero', p: 'teal', z: 'ig-portrait', k: ['mental health', 'wellness', 'counselling'],
      x: t('Wellness', 'Mental Wellness Matters', 'Talk to someone who listens', '', ['Confidential sessions', 'Online or in-person', 'Licensed counsellors'], 'Book a Session'), v: { L: { valign: 'center' }, d: [{ t: 'waves', c: 'accent', a: 0.25 }, { t: 'leaves', c: 'accent', a: 0.2, n: 2 }] } },
    { n: 'Pharmacy Home Delivery', c: 'Healthcare', r: 'gradDiagonal', p: 'forest', z: 'ig-portrait', ct: ['whatsapp', 'phone'], k: ['pharmacy', 'medicine', 'delivery'],
      x: t('Home Delivery', 'Medicines Delivered to Your Door', 'Order on WhatsApp in minutes', 'Upload your prescription and we’ll handle the rest.', [], 'Order Now'), v: { d: [{ t: 'cross', n: 6, c: 'text', a: 0.08 }] } },

    // ---- Travel & Tourism ----
    { n: 'Explore the Mountains', c: 'Travel & Tourism', r: 'travelMountains', p: 'sky', z: 'ig-portrait', ct: ['phone', 'website'], k: ['mountains', 'trek', 'holiday'],
      x: t('Explore', 'The Mountains Are Calling', '5 days · 4 nights', '', ['Stay', 'Meals', 'Guided treks'], 'Book Your Trip') },
    { n: 'Weekend Getaway', c: 'Travel & Tourism', r: 'photoBottom', p: 'ocean', z: 'story', ct: ['phone'], k: ['weekend', 'getaway', 'travel'],
      x: t('Weekend Getaway', 'Escape the Everyday', 'Short trips, big memories', '', ['Hotel', 'Transfers', 'Sightseeing'], 'Plan My Getaway'), v: { L: { align: 'center', featStyle: 'pill', keys: ['tag', 'headline', 'subheadline', 'features', 'cta'] }, d: [{ t: 'mountains', c: 'accent2', a: 0.25 }], decorFront: true, ft: 'pills', lg: 'top-center' } },
    { n: 'Beach Holiday Packages', c: 'Travel & Tourism', r: 'photoFramed', p: 'sand', z: 'ig-square', ct: ['phone'], k: ['beach', 'holiday', 'package'],
      x: t('Summer Special', 'Beach Holiday Packages', 'Sun, sand and slow mornings', '', [], 'View Packages'), v: { d: [{ t: 'waves', c: 'accent2', a: 0.25 }], ft: 'line' } },
    { n: 'Discover Incredible India', c: 'Travel & Tourism', r: 'editorialRule', p: 'cream', z: 'ig-portrait', ct: ['phone', 'website'], k: ['india', 'heritage', 'culture'],
      x: t('Travel Journal', 'Discover Incredible India', 'Culture, cuisine and colour', 'Curated tours across heritage cities, backwaters and hill stations.', ['Heritage walks', 'Local food trails', 'Expert guides'], 'Start Exploring'), v: { d: [{ t: 'rangoli', pos: 'br', a: 0.25, size: 1.3 }], lg: 'bottom-right' } },
    { n: 'Honeymoon Specials', c: 'Travel & Tourism', r: 'inviteFrame', p: 'rose', z: 'ig-portrait', ct: ['phone'], k: ['honeymoon', 'couples', 'romantic'],
      x: t('Just for Two', 'Honeymoon Specials', 'Handpicked romantic escapes', 'Private stays, candlelit dinners and unforgettable views.', [], 'Plan Your Escape'), v: { d: [{ t: 'sparkles', n: 12, c: 'accent', a: 0.5 }, { t: 'frame', c: 'accent', a: 0.5 }] } },
    { n: 'Adventure Awaits', c: 'Travel & Tourism', r: 'boldGiant', p: 'forest', z: 'facebook', k: ['adventure', 'outdoor', 'travel'],
      x: t('Adventure', 'Adventure Awaits', 'Rafting · Trekking · Camping', '', [], 'Book Now'), v: { d: [{ t: 'mountains', c: 'accent', a: 0.35 }], ft: 'line' } },

    // ---- Corporate Events ----
    { n: 'Annual Tech Summit', c: 'Corporate Events', r: 'neonLines', p: 'night', z: 'linkedin', k: ['summit', 'conference', 'tech event'],
      x: t('12–13 December', 'Annual Tech Summit', '', 'Two days of talks, workshops and networking.', ['AI', 'Cloud', 'Product'], 'Register Now'), v: { L: { align: 'left' }, fo: ['Space Grotesk', 'Inter', 700, true], d: [{ t: 'neon', c: 'accent2', a: 0.7, mode: 'corner' }, { t: 'grid', c: 'accent', a: 0.06 }], lg: 'top-left' } },
    { n: 'Business Networking Night', c: 'Corporate Events', r: 'luxCenter', p: 'goldNoir', z: 'ig-portrait', k: ['networking', 'evening', 'business'],
      x: t('Members & Guests', 'Business Networking Night', 'Friday · 7 PM onwards', 'An evening of conversation, ideas and new connections.', [], 'Reserve a Seat'), v: { d: [{ t: 'bokeh', n: 12, c: 'accent', a: 0.25 }, { t: 'frame', c: 'accent', a: 0.5 }] } },
    { n: 'Product Launch Event', c: 'Corporate Events', r: 'eventDate', p: 'charcoal', z: 'ig-square', k: ['launch event', 'keynote', 'product'],
      x: t('05 DEC', 'Product Launch Event', 'Live keynote & demo', '', ['Friday, 5 December', '4:00 PM IST', 'Venue name or online'], 'Save the Date'), v: { d: [{ t: 'glow', pos: 'tl', c: 'accent', a: 0.3 }, { t: 'sparkles', n: 10, c: 'accent2', a: 0.6 }] } },
    { n: 'Leadership Conference', c: 'Corporate Events', r: 'editorialBoxed', p: 'steel', z: 'facebook', k: ['leadership', 'conference', 'speakers'],
      x: t('Conference 2026', 'Leadership Conference', 'Lead with clarity', 'Keynotes and panels from leaders across industries.', ['Keynotes', 'Panels', 'Workshops'], 'Get Your Pass'), v: { d: [{ t: 'frame', double: true, c: 'accent', a: 0.7 }], lg: 'top-left', L: { mastRight: '2026' } } },
    { n: 'Webinar: Future of Work', c: 'Corporate Events', r: 'techFeatures', p: 'royal', z: 'ig-portrait', k: ['webinar', 'future of work', 'online'],
      x: t('Live Webinar', 'The Future of Work', 'Thursday · 5 PM IST', '', ['Remote collaboration', 'AI at work', 'Building great teams'], 'Register Free'), v: { L: { featStyle: 'icons', icons: ['users', 'cpu', 'heart'] }, d: [{ t: 'orbits', pos: 'br', c: 'accent', a: 0.2 }] } },
    { n: 'Annual Day Celebration', c: 'Corporate Events', r: 'festiveConfetti', p: 'grape', z: 'ig-portrait', k: ['annual day', 'celebration', 'company event'],
      x: t('Celebrate', 'Annual Day 2026', 'Awards · Music · Dinner', 'Join us to celebrate a year of teamwork.', [], 'RSVP') },

    // ---- Motivational Quotes ----
    { n: 'Dream Big. Start Small.', c: 'Motivational Quotes', r: 'quoteCenter', p: 'ink', z: 'ig-square', k: ['quote', 'motivation', 'inspiration'],
      x: t('', 'Dream big. Start small. Act now.', 'Monday Motivation', '', [], '') },
    { n: 'Progress Over Perfection', c: 'Motivational Quotes', r: 'quoteBar', p: 'cream', z: 'ig-portrait', k: ['progress', 'quote', 'mindset'],
      x: t('', 'Progress over perfection, every single day.', 'Daily Reminder', '', [], ''), v: { d: [{ t: 'leaves', c: 'accent', a: 0.2, n: 2 }], lg: 'bottom-right' } },
    { n: 'Every Expert Was a Beginner', c: 'Motivational Quotes', r: 'minimalHero', p: 'softGrey', z: 'story', k: ['learning', 'quote', 'growth'],
      x: t('Mindset', 'Every expert was once a beginner.', 'Keep learning.', '', [], ''), v: { L: { valign: 'center', maxW: 0.95 }, d: [{ t: 'dots', pos: 'tr', c: 'accent', a: 0.3 }, { t: 'dots', pos: 'bl', c: 'accent', a: 0.3 }], ft: 'line' } },
    { n: 'Small Steps Every Day', c: 'Motivational Quotes', r: 'abstractArcs', p: 'peach', z: 'ig-square', k: ['habits', 'quote', 'consistency'],
      x: t('Daily Habit', 'Small steps every day add up to big results.', '', '', [], ''), v: { d: [{ t: 'arcs', c: 'accent', a: 0.35 }, { t: 'dots', pos: 'tr', c: 'accent', a: 0.3 }], L: { valign: 'center' } } },
    { n: 'Done Is Better Than Perfect', c: 'Motivational Quotes', r: 'boldOutline', p: 'yellow', z: 'ig-portrait', k: ['productivity', 'quote', 'bold'],
      x: t('Note to Self', 'Done Is Better Than Perfect', '', '', [], ''), v: { d: [{ t: 'zigzag', pos: 'tr', c: 'accent', a: 0.8 }, { t: 'zigzag', pos: 'bl', c: 'accent2', a: 0.8 }] } },
    { n: 'Keep Building', c: 'Motivational Quotes', r: 'quoteCenter', p: 'aurora', z: 'story', k: ['builders', 'quote', 'entrepreneur'],
      x: t('', 'Keep building. The results are on their way.', 'For every founder', '', [], ''), v: { d: [{ t: 'blobs', n: 3, a: 0.35 }, { t: 'sparkles', n: 12, c: 'accent', a: 0.5 }], bg: { type: 'mesh' }, transparentOk: false } },

    // ---- Festival Greetings ----
    { n: 'Happy Diwali', c: 'Festival Greetings', r: 'festiveDiya', p: 'saffron', z: 'ig-portrait', k: ['diwali', 'deepavali', 'festival of lights'],
      x: t('Happy', 'Diwali', 'May your home be filled with light and joy', 'Warm wishes from all of us.', [], '') },
    { n: 'Happy Pongal', c: 'Festival Greetings', r: 'festiveRangoli', p: 'sand', z: 'ig-square', k: ['pongal', 'harvest', 'sankranti'],
      x: t('Happy', 'Pongal', 'Wishing you a sweet and prosperous harvest', '', [], '') },
    { n: 'Happy Holi', c: 'Festival Greetings', r: 'festiveConfetti', p: 'holi', z: 'ig-portrait', k: ['holi', 'colours', 'spring'],
      x: t('Happy', 'Holi', 'Let the colours of joy brighten your day', '', [], ''), v: { d: [{ t: 'blobs', n: 6, a: 0.45, size: 1.2 }, { t: 'confetti', n: 70, a: 0.95 }], bg: { type: 'mesh' } } },
    { n: 'Eid Mubarak', c: 'Festival Greetings', r: 'festiveCrescent', p: 'emeraldGold', z: 'ig-portrait', k: ['eid', 'ramadan', 'mubarak'],
      x: t('Wishing you', 'Eid Mubarak', 'Peace, happiness and togetherness', '', [], '') },
    { n: 'Happy Independence Day', c: 'Festival Greetings', r: 'festiveMandala', p: 'tricolor', z: 'ig-square', k: ['independence day', '15 august', 'india'],
      x: t('Happy', 'Independence Day', 'Celebrating the spirit of freedom', '', [], ''), v: { d: [{ t: 'mandala', pos: 'c', c: 'text', a: 0.1 }, { t: 'waves', c: 'accent', a: 0.3 }] } },
    { n: 'Happy New Year', c: 'Festival Greetings', r: 'festiveFireworks', p: 'night', z: 'ig-square', k: ['new year', 'celebration', '2027'],
      x: t('Cheers to', 'Happy New Year', 'New goals. New possibilities.', '', [], '') },

    // ---- Digital Invitations ----
    { n: 'Grand Opening Invitation', c: 'Digital Invitations', r: 'inviteFrame', p: 'goldNoir', z: 'ig-portrait', ct: ['phone'], k: ['grand opening', 'invitation', 'inauguration'],
      x: t('You’re Invited', 'Grand Opening', 'Saturday, 20 December · 6 PM', 'Venue Name, Street, City', [], 'RSVP') },
    { n: 'Wedding Invitation', c: 'Digital Invitations', r: 'inviteArch', p: 'champagne', z: 'a4', k: ['wedding', 'marriage', 'invitation'],
      x: t('Together with their families', 'Name & Name', 'Sunday, 14 February 2027', 'Venue Name, City', [], 'Kindly RSVP') },
    { n: 'Birthday Celebration', c: 'Digital Invitations', r: 'festiveConfetti', p: 'lavender', z: 'ig-square', k: ['birthday', 'party', 'celebration'],
      x: t('Let’s Celebrate', 'Birthday Party', 'Saturday · 5 PM', 'Venue Name, City', [], 'RSVP'), v: { d: [{ t: 'bunting', a: 0.9 }, { t: 'confetti', n: 50, a: 0.8 }] } },
    { n: 'Housewarming Ceremony', c: 'Digital Invitations', r: 'inviteFrame', p: 'cream', z: 'ig-portrait', k: ['housewarming', 'griha pravesh', 'new home'],
      x: t('Please join us for our', 'Housewarming', 'Sunday, 11 January · 10 AM', 'Your New Address, City', [], 'We Hope to See You'), v: { d: [{ t: 'rangoli', pos: 'b', a: 0.3, size: 1.2 }, { t: 'frame', c: 'accent', a: 0.6 }] } },
    { n: 'Office Inauguration', c: 'Digital Invitations', r: 'luxFrame', p: 'navyGold', z: 'a4', k: ['inauguration', 'office', 'opening'],
      x: t('Cordially Invites You', 'Office Inauguration', 'Monday, 5 January · 11 AM', 'Office Address, City', [], 'RSVP') },
    { n: 'Gala Dinner', c: 'Digital Invitations', r: 'luxFrame', p: 'maroon', z: 'story', k: ['gala', 'dinner', 'awards'],
      x: t('An Evening of Celebration', 'Gala Dinner', 'Saturday · 8 PM · Black tie', 'Hotel Name, City', [], 'Reserve Your Table'), v: { L: { tagStyle: 'script' }, d: [{ t: 'frame', double: true, c: 'accent', a: 0.9 }, { t: 'sparkles', n: 14, c: 'accent', a: 0.6 }] } },

    // ---- More across categories (to keep every category well stocked) ----
    { n: 'Launch Countdown', c: 'Website & App Launches', r: 'neonCard', p: 'grape', z: 'ig-portrait', k: ['countdown', 'launch', 'teaser'],
      x: t('3 Days to Go', 'The Wait Is Almost Over', '', 'Our new platform launches this Friday.', ['Sneak peeks daily', 'Launch-day offer'], 'Get Notified'), v: { L: { card: 'outline' }, d: [{ t: 'fireworks', n: 3, c: 'accent', a: 0.4 }, { t: 'grid', c: 'accent', a: 0.05 }] } },
    { n: 'Smart Speaker Showcase', c: 'Product Promotions', r: 'techOrbit', p: 'aurora', z: 'ig-square', k: ['gadget', 'electronics', 'tech product'],
      x: t('₹4,999', 'Sound That Fills the Room', 'Wireless · Voice-ready', '', ['20h battery', 'Hands-free'], 'Buy Now'), v: { fo: ['Outfit', 'Inter', 800], d: [{ t: 'rings', pos: 'c', c: 'accent', a: 0.15, n: 8 }], ft: 'line' } },
    { n: 'Plans & Pricing', c: 'Service Promotions', r: 'compareCard', p: 'brand', z: 'ig-portrait', k: ['pricing', 'plans', 'comparison'],
      x: t('Plans', 'Choose the Right Plan', 'Starter vs Growth', '', ['1 user | Up to 10 users', 'Basic chatbot | AI chatbot', 'Email support | Priority support', 'Monthly report | Live dashboard'], 'Compare Plans') },
    { n: 'Website Before & After', c: 'Business Promotions', r: 'compareCard', p: 'charcoal', z: 'facebook', k: ['before after', 'redesign', 'website'],
      x: t('Redesign', 'Before & After a Website Refresh', 'Old Site | New Site', '', ['Slow to load | Loads in seconds', 'Hard to use on phones | Mobile-first', 'No enquiries | Clear calls to action'], ''), v: { L: { card: 'neon', align: 'left' }, d: [{ t: 'halftone', pos: 'tl', c: 'accent', a: 0.2 }], ft: 'line', lg: 'top-left' } },
    { n: 'Instagram Carousel Cover', c: 'Instagram Posts', r: 'cardOffset', p: 'electric', z: 'ig-portrait', k: ['carousel', 'cover', 'instagram'],
      x: t('Swipe →', '5 Mistakes to Avoid on Your Website', '', 'Save this post and share it with your team.', [], 'Swipe to Read'), v: { L: { card: 'solid', align: 'left' }, d: [{ t: 'triangles', n: 8, c: 'accent', a: 0.4 }], ft: 'minimal', lg: 'top-left' } },
    { n: 'How It Works', c: 'Technology & AI', r: 'infoSteps', p: 'night', z: 'story', k: ['how it works', 'process', 'onboarding'],
      x: t('How It Works', 'Go Live in 3 Simple Steps', '', '', ['Connect your WhatsApp number', 'Upload your FAQs', 'Switch on your AI assistant'], 'Start Now'), v: { d: [{ t: 'glow', pos: 'tl', c: 'accent', a: 0.3 }, { t: 'sparkles', n: 10, c: 'accent', a: 0.5 }], L: { align: 'center' }, lg: 'top-center' } },
    { n: 'Season’s Greetings', c: 'Festival Greetings', r: 'inviteArch', p: 'emeraldGold', z: 'story', k: ['christmas', 'season', 'holidays'],
      x: t('Season’s Greetings', 'Merry Christmas', 'Wishing you joy and peace', 'With warm wishes from our team', [], ''), v: { d: [{ t: 'sparkles', n: 24, c: 'accent', a: 0.7 }, { t: 'bokeh', n: 8, c: 'accent', a: 0.15 }], lg: 'bottom-center' } },
    { n: 'Customer Feedback Wall', c: 'Testimonials', r: 'infoTiles', p: 'softGrey', z: 'linkedin', k: ['feedback', 'reviews', 'wall'],
      x: t('Feedback', 'What Customers Tell Us', '', '', ['“Quick and professional”', '“Super easy to work with”', '“Great value for money”'], ''), v: { L: { align: 'left', icons: ['star', 'heart', 'sparkles'] } } },
    { n: 'Medical Services Grid', c: 'Healthcare', r: 'infoTiles', p: 'medical', z: 'ig-square', ct: ['phone'], k: ['services', 'clinic', 'departments'],
      x: t('Our Departments', 'Care Under One Roof', '', '', ['General Medicine', 'Paediatrics', 'Cardiology', 'Diagnostics'], 'Book Appointment'), v: { L: { icons: ['heart', 'users', 'heart', 'target'] }, d: [{ t: 'cross', n: 4, c: 'accent', a: 0.1 }] } },
    { n: 'Hiring: Join the Support Team', c: 'Hiring & Careers', r: 'boldGiant', p: 'sunset', z: 'story', k: ['support jobs', 'hiring', 'customer service'],
      x: t('Hiring', 'Join Our Support Team', 'Full-time · Freshers welcome', '', [], 'Apply Today'), v: { d: [{ t: 'bigtext', text: 'JOIN', len: 4, pos: 'b', a: 0.1 }], ft: 'line' } },
    { n: 'Course Comparison', c: 'Educational Promotions', r: 'compareTable', p: 'cream', z: 'ig-square', k: ['course', 'online vs offline', 'learning'],
      x: t('Learning Options', 'Online or Classroom?', 'Online vs Classroom', '', ['Learn anywhere | Learn on campus', 'Recorded sessions | Live doubt-solving', 'Flexible pace | Fixed schedule'], 'Find Your Fit'), v: { d: [{ t: 'leaves', c: 'accent', a: 0.15, n: 2 }] } },
    { n: 'Property Comparison', c: 'Real Estate', r: 'compareCard', p: 'emeraldGold', z: 'ig-portrait', ct: ['phone'], k: ['rent vs buy', 'property', 'comparison'],
      x: t('Rent vs Buy', 'Why Own Your Home?', 'Renting vs Owning', '', ['Rising rent | Fixed EMI', 'No equity | Builds an asset', 'Limited control | Make it yours'], 'Talk to an Advisor'), v: { L: { card: 'outline' }, d: [{ t: 'skyline', c: 'accent', a: 0.12 }] } },
    { n: 'Travel Itinerary', c: 'Travel & Tourism', r: 'infoSteps', p: 'teal', z: 'ig-portrait', ct: ['phone'], k: ['itinerary', 'tour plan', 'days'],
      x: t('3-Day Tour', 'Your Trip at a Glance', '', '', ['Day 1: Arrival & city tour', 'Day 2: Backwater cruise', 'Day 3: Spice garden & departure'], 'Book This Tour'), v: { d: [{ t: 'waves', c: 'accent', a: 0.2 }, { t: 'leaves', c: 'accent', a: 0.2, n: 1 }] } },
    { n: 'Event Agenda', c: 'Corporate Events', r: 'infoStats', p: 'steel', z: 'ig-portrait', k: ['agenda', 'schedule', 'event'],
      x: t('Agenda', 'Summit Schedule', '', '', ['9:00 | Registration', '10:00 | Keynote', '12:30 | Lunch & networking', '14:00 | Workshops'], 'Download Agenda'), v: { L: { align: 'left' }, d: [{ t: 'squares', pos: 'tr', c: 'accent', a: 0.25 }] } },
    { n: 'Thought for the Day', c: 'Motivational Quotes', r: 'testiPlain', p: 'paper', z: 'ig-portrait', k: ['thought', 'quote', 'daily'],
      x: t('Thought for the Day', '', 'Your Name, Your Title', 'Customers remember how you made them feel. Make every interaction count.', [], ''), v: { d: [{ t: 'frame', c: 'accent', a: 0.6 }] } },
    { n: 'Brand Story Collage', c: 'Company Branding', r: 'photoFramed', p: 'brand', z: 'ig-portrait', b: 'Infinitia Hub', k: ['brand story', 'collage', 'team photo'],
      x: t('Our Story', 'Small Team. Big Ideas.', '', 'Add a team photo to tell your story.', ['Design', 'Build', 'Grow'], 'Say Hello'), v: { d: [{ t: 'arcs', c: 'accent', a: 0.3 }, { t: 'sparkles', n: 8, c: 'accent', a: 0.6 }] } },
    { n: 'Invitation to Webinar', c: 'Digital Invitations', r: 'inviteArch', p: 'indigo', z: 'ig-portrait', k: ['webinar invite', 'online', 'invitation'],
      x: t('You’re Invited', 'Live Webinar', 'Thursday · 6 PM IST', 'Online — register to receive the link', [], 'Register'), v: { d: [{ t: 'dots', pos: 'tl', c: 'accent', a: 0.3 }, { t: 'dots', pos: 'br', c: 'accent', a: 0.3 }], fo: ['Playfair Display', 'Inter', 700], lg: 'top-center' } }
  ];

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function build() {
    return ENTRIES.map((x, i) => {
      const R = RECIPES[x.r];
      if (!R) throw new Error('Unknown recipe ' + x.r);
      const v = x.v || {};
      const P = PALETTES[x.p];
      const fo = v.fo || R.fo;
      const id = 't' + String(i + 1).padStart(3, '0');
      return {
        id, name: x.n, category: x.c, family: R.f, recipe: x.r, paletteKey: x.p, tone: P[7],
        brand: x.b || 'Any', size: x.z, keywords: x.k || [], popularity: x.hot || (40 + (hashStr(x.n) % 45)), order: i,
        layout: { ...R.L, ...(v.L || {}), decorFront: v.decorFront != null ? v.decorFront : R.decorFront },
        decor: v.d || R.d,
        bg: { ...R.bg, ...(v.bg || {}) },
        fonts: { head: fo[0], body: fo[1], weight: fo[2], upper: !!fo[3] },
        palette: { bg1: P[0], bg2: P[1], bg3: P[2], text: P[3], muted: P[4], accent: P[5], accent2: P[6] },
        footer: v.ft || R.ft, logo: v.lg || R.lg, highlight: v.hl || R.hl || 'none',
        radius: R.rad == null ? 0.7 : R.rad, padding: R.pad || 0.07, lineHeight: R.lh || 1.1,
        transparentOk: v.transparentOk != null ? v.transparentOk : !!R.transparentOk,
        usesImage: ['split', 'showcase', 'photo', 'diagonal', 'testimonial'].includes((v.L && v.L.type) || R.L.type),
        contacts: x.ct || ['website', 'whatsapp'],
        text: x.x,
        seed: (hashStr(id) % 997) + 1
      };
    });
  }

  const TEMPLATES = build();

  /* A clean starter used by "New Poster" — not counted in the gallery. */
  const BLANK = {
    ...TEMPLATES[0], id: 'blank', name: 'Blank Poster', category: 'Company Branding', family: 'minimal', recipe: 'minimalHero', paletteKey: 'clean', tone: 'light',
    layout: { type: 'hero', align: 'left', tagStyle: 'soft', ctaStyle: 'solid', featStyle: 'check' }, decor: [], bg: { type: 'solid' },
    fonts: { head: 'Poppins', body: 'Inter', weight: 700, upper: false }, palette: { ...TEMPLATES[0].palette, bg1: '#FFFFFF', bg2: '#F1F5F9', bg3: '#F1F5F9', text: '#0F172A', muted: '#475569', accent: '#6D28D9', accent2: '#2563EB' },
    footer: 'line', logo: 'top-left', highlight: 'none', hidden: true, usesImage: false,
    text: t('Your Tag', 'Your Headline Here', 'Add a short subheadline', 'Describe your offer, service or announcement in a sentence or two.', [], 'Call to Action')
  };

  function defaultStyle(T) {
    return {
      bgType: T.bg.type, bgAngle: T.bg.angle || 135, bgCx: T.bg.cx, bgCy: T.bg.cy,
      bg1: T.palette.bg1, bg2: T.palette.bg2, bg3: T.palette.bg3, text: T.palette.text, muted: T.palette.muted,
      accent: T.palette.accent, accent2: T.palette.accent2,
      headFont: T.fonts.head, bodyFont: T.fonts.body, weight: T.fonts.weight, upper: T.fonts.upper,
      headScale: 1, bodyScale: 1, align: 'auto', lineHeight: T.lineHeight, letterSpacing: T.fonts.upper ? 0.01 : 0, spacing: 1,
      padding: T.padding, radius: T.radius, highlight: T.highlight,
      logoSize: 0.075, logoPos: T.logo, imagePos: 'auto', decorOpacity: 1, seed: T.seed, bgOverlay: 0.55,
      transparent: false, useBrandColors: false, useBrandFont: false, brandWithLogo: false
    };
  }

  const PLACEHOLDER = { website: 'www.yourwebsite.com', phone: '+00 00000 00000', whatsapp: '+00 00000 00000', brand: 'Your Brand' };

  function defaultFields(T, brand) {
    const x = T.text;
    return {
      brand: (brand && brand.name) || PLACEHOLDER.brand,
      tag: x.tag || '', headline: x.headline || '', subheadline: x.subheadline || '', description: x.description || '',
      features: (x.features || []).slice(), cta: x.cta || '',
      website: (brand && brand.website) || PLACEHOLDER.website,
      phone: (brand && brand.phone) || PLACEHOLDER.phone,
      whatsapp: (brand && brand.whatsapp) || PLACEHOLDER.whatsapp,
      footer: x.footer || ''
    };
  }
  function defaultHidden(T) {
    const h = {};
    ['website', 'phone', 'whatsapp'].forEach(k => { if (!T.contacts.includes(k)) h[k] = true; });
    return h;
  }

  root.TemplateRegistry = {
    SIZES, CATEGORIES, FAMILIES, TONES, PALETTES, RECIPES, TEMPLATES, BLANK, PLACEHOLDER,
    defaultStyle, defaultFields, defaultHidden,
    byId(id) { return id === 'blank' ? BLANK : TEMPLATES.find(t => t.id === id) || null; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
