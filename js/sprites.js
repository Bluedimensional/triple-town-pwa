// sprites.js — hand-drawn SVG tile art, keyed by tile type.
//
// This is the swappable asset map (vector edition). Each entry is a self-
// contained SVG string on a 0..100 canvas. To swap in different art, replace
// a string here; nothing in the game logic depends on how a tile looks.
//
// Outline (dark strokes) and the ground shadow are baked into each sprite, so
// the renderer needs NO CSS filter for normal pieces — that keeps things fast.
// Gradient ids are unique per sprite type so they don't collide when injected.

// Soft two-layer contact shadow, drawn behind the piece. Tagged so it can be
// hidden on the active (white-bordered) piece.
const shadow = (cy, rx, ry) =>
  `<ellipse class="pc-shadow" cx="50" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0e1f08" opacity="0.16"/>` +
  `<ellipse class="pc-shadow" cx="50" cy="${cy}" rx="${(rx * 0.7).toFixed(1)}" ry="${(ry * 0.7).toFixed(1)}" fill="#0a1706" opacity="0.18"/>`;

const svg = (inner, sh) =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">` +
  `${sh ? shadow(sh.cy, sh.rx, sh.ry) : ''}${inner}</svg>`;

// --- plants -------------------------------------------------------------

// A tall, bushy patch of grass: irregular spiky blade tips of varying heights,
// with a dark->light vertical gradient.
const grass = svg(`
  <defs><linearGradient id="grassG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#c8e85f"/><stop offset="38%" stop-color="#5aa62f"/>
    <stop offset="100%" stop-color="#276214"/></linearGradient></defs>
  <path d="M17 63 L19 47 L24 27 L28 45 L33 36 L37 44 L42 21 L47 43 L51 31
           L55 44 L60 24 L65 43 L69 34 L74 46 L79 50 L82 63
           C84 71 80 75.2 72 75.8 C60 77 40 77 28 75.8
           C20 75.2 16 71 17 63 Z"
        fill="url(#grassG)" stroke="#1c4410" stroke-width="2.6" stroke-linejoin="round"/>
  <g stroke="#2a6417" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.7">
    <path d="M31 66 L33 43"/><path d="M42 68 L43 30"/><path d="M52 66 L53 40"/>
    <path d="M62 67 L62 36"/><path d="M71 66 L71 46"/></g>
  <g stroke="#d9f083" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.45">
    <path d="M24 40 L24 30"/><path d="M42 34 L42 24"/><path d="M60 36 L60 27"/></g>`, { cy: 76, rx: 27, ry: 6.5 });

const bush = svg(`
  <defs><radialGradient id="bushG" cx="40%" cy="32%" r="72%">
    <stop offset="0%" stop-color="#7cc047"/><stop offset="62%" stop-color="#4d8a29"/>
    <stop offset="100%" stop-color="#3a7020"/></radialGradient></defs>
  <circle cx="50" cy="52" r="37" fill="#274c14"/>
  <circle cx="50" cy="50" r="35" fill="url(#bushG)"/>
  <g fill="#3b7a1f" opacity="0.65">
    <circle cx="37" cy="45" r="6.5"/><circle cx="61" cy="41" r="5"/>
    <circle cx="57" cy="61" r="7"/><circle cx="39" cy="62" r="5.5"/>
    <circle cx="50" cy="52" r="5"/><circle cx="68" cy="55" r="4.5"/></g>`, { cy: 85, rx: 30, ry: 7 });

// Two overlapping sets of leaves (a lower olive canopy + upper bright canopy).
const tree = svg(`
  <defs>
    <radialGradient id="treeBack" cx="42%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#9cbb42"/><stop offset="100%" stop-color="#6d8d27"/></radialGradient>
    <radialGradient id="treeFront" cx="42%" cy="30%" r="74%">
      <stop offset="0%" stop-color="#7cc047"/><stop offset="100%" stop-color="#3f7a22"/></radialGradient>
  </defs>
  <rect x="45" y="62" width="11" height="27" rx="4" fill="#7a4a22" stroke="#452a12" stroke-width="3"/>
  <circle cx="45" cy="50" r="23" fill="url(#treeBack)" stroke="#3a5a16" stroke-width="3"/>
  <g fill="#6d8d27" opacity="0.6"><circle cx="38" cy="46" r="4.5"/><circle cx="47" cy="58" r="4"/></g>
  <circle cx="58" cy="38" r="18" fill="url(#treeFront)" stroke="#2f5e18" stroke-width="3"/>
  <g fill="#3f7a22" opacity="0.55"><circle cx="52" cy="35" r="4"/><circle cx="63" cy="44" r="4.5"/><circle cx="64" cy="34" r="3.5"/></g>`, { cy: 89, rx: 19, ry: 5.5 });

// --- buildings ----------------------------------------------------------

const hut = svg(`
  <rect x="31" y="52" width="38" height="34" rx="3" fill="#a2412a" stroke="#45200f" stroke-width="3"/>
  <g stroke="#7a2c1c" stroke-width="2">
    <line x1="31" y1="63" x2="69" y2="63"/><line x1="31" y1="74" x2="69" y2="74"/>
    <line x1="50" y1="52" x2="50" y2="63"/><line x1="40" y1="63" x2="40" y2="74"/>
    <line x1="60" y1="63" x2="60" y2="74"/><line x1="45" y1="74" x2="45" y2="86"/></g>
  <path d="M23 54 L50 24 L77 54 Z" fill="#c98a3e" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 30 L68 50 L32 50 Z" fill="#db9f52" opacity="0.6"/>
  <path d="M44 86 L44 70 Q50 64 56 70 L56 86 Z" fill="#2a1610"/>`, { cy: 89, rx: 22, ry: 5.5 });

const house = svg(`
  <rect x="26" y="52" width="48" height="34" fill="#ecdcaa" stroke="#463516" stroke-width="3"/>
  <path d="M20 54 L50 26 L80 54 Z" fill="#b5462e" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <rect x="44" y="66" width="13" height="20" fill="#6a4423" stroke="#463516" stroke-width="2"/>
  <rect x="31" y="60" width="10" height="10" fill="#8fc0d8" stroke="#463516" stroke-width="2"/>
  <rect x="59" y="60" width="10" height="10" fill="#8fc0d8" stroke="#463516" stroke-width="2"/>`, { cy: 89, rx: 26, ry: 6 });

const mansion = svg(`
  <rect x="20" y="50" width="60" height="36" fill="#ecdcaa" stroke="#463516" stroke-width="3"/>
  <rect x="60" y="20" width="10" height="18" fill="#8a5a2b" stroke="#45200f" stroke-width="2"/>
  <path d="M16 52 L50 24 L84 52 Z" fill="#a53e28" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <rect x="44" y="66" width="13" height="20" fill="#6a4423" stroke="#463516" stroke-width="2"/>
  <g fill="#8fc0d8" stroke="#463516" stroke-width="2">
    <rect x="26" y="58" width="9" height="9"/><rect x="65" y="58" width="9" height="9"/>
    <rect x="26" y="72" width="9" height="9"/><rect x="65" y="72" width="9" height="9"/></g>`, { cy: 89, rx: 32, ry: 6.5 });

const castle = svg(`
  <rect x="24" y="40" width="52" height="46" fill="#c9c4b0" stroke="#4a463a" stroke-width="3"/>
  <g fill="#c9c4b0" stroke="#4a463a" stroke-width="3">
    <rect x="24" y="30" width="11" height="14"/><rect x="44" y="30" width="12" height="14"/>
    <rect x="65" y="30" width="11" height="14"/></g>
  <rect x="42" y="62" width="16" height="24" fill="#5a5346"/>
  <path d="M42 62 Q50 54 58 62" fill="#5a5346"/>
  <g fill="#9a9484"><rect x="30" y="50" width="8" height="8"/><rect x="62" y="50" width="8" height="8"/></g>`, { cy: 89, rx: 28, ry: 6.5 });

const floatingCastle = svg(`
  <ellipse cx="50" cy="80" rx="34" ry="12" fill="#eef4f8"/>
  <ellipse cx="34" cy="76" rx="14" ry="10" fill="#dfe9f0"/>
  <ellipse cx="66" cy="76" rx="14" ry="10" fill="#dfe9f0"/>
  <rect x="28" y="34" width="44" height="36" fill="#cfc9dd" stroke="#4a4658" stroke-width="3"/>
  <g fill="#cfc9dd" stroke="#4a4658" stroke-width="3">
    <rect x="28" y="26" width="10" height="12"/><rect x="45" y="26" width="10" height="12"/>
    <rect x="62" y="26" width="10" height="12"/></g>
  <rect x="44" y="50" width="12" height="20" fill="#4a4658"/>`);

const tripleCastle = svg(`
  <defs><linearGradient id="tcG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f4d768"/><stop offset="100%" stop-color="#caa02c"/></linearGradient></defs>
  <path d="M50 8 L54 20 L66 20 L56 28 L60 40 L50 32 L40 40 L44 28 L34 20 L46 20 Z" fill="#ffe07a"/>
  <rect x="22" y="42" width="56" height="46" fill="url(#tcG)" stroke="#7a5c12" stroke-width="3"/>
  <g fill="url(#tcG)" stroke="#7a5c12" stroke-width="3">
    <rect x="22" y="34" width="12" height="12"/><rect x="44" y="34" width="12" height="12"/>
    <rect x="66" y="34" width="12" height="12"/></g>
  <rect x="42" y="64" width="16" height="24" fill="#7a5c12"/>`, { cy: 91, rx: 30, ry: 6.5 });

// --- bears & tombs ------------------------------------------------------

// Bear, traced from the original art. Key points from the reference:
//   * body is wide and squat, with a warm light->dark vertical gradient, and no
//     seam between head and torso (one shade, so the "head" reads as oversized);
//   * NO pale muzzle patch — the nose and mouth sit straight on the gradient;
//   * the pale rounded shape is a BELLY, sitting on the dark "pants";
//   * eyes are single angled almonds (socket and brow in one), not a brow line
//     plus a socket, with a small red pupil inside;
//   * ears are small, mostly tucked behind the head.
// The silhouette (ears + legs + body) is stamped twice: once fattened in the
// faint rim colour, then again in the real colours, so a thin light rim traces
// the whole outline. `.bear-eye` is animated in CSS (blink); those elements
// carry no transform attribute, since the CSS transform would override it.
const BEAR_EAR_L = 'M11 22 C10.6 15 12.2 10.2 14.4 8 C16.6 9.8 20.2 8.4 23.2 9.8 '
  + 'C28.6 12 31 16 31 21.4 C31 27.6 26.4 29 21 29 C14.8 29 11.4 26.4 11 22 Z';
const BEAR_EAR_R = 'M89 22 C89.4 15 87.8 10.2 85.6 8 C83.4 9.8 79.8 8.4 76.8 9.8 '
  + 'C71.4 12 69 16 69 21.4 C69 27.6 73.6 29 79 29 C85.2 29 88.6 26.4 89 22 Z';
const BEAR_BODY = 'M11 35 C11 23 16.5 16.5 30 16.5 L70 16.5 C83.5 16.5 89 23 89 35 '
  + 'L86 71 C86 82 81 86.5 70 86.5 L30 86.5 C19 86.5 14 82 14 71 Z';
const BEAR_LEGS =
  '<rect x="19" y="81" width="12" height="13" rx="3.4"/><rect x="33.5" y="81" width="12" height="13" rx="3.4"/>'
  + '<rect x="54.5" y="81" width="12" height="13" rx="3.4"/><rect x="69" y="81" width="12" height="13" rx="3.4"/>';

const bear = svg(`
  <defs>
    <clipPath id="bearBodyClip"><path d="${BEAR_BODY}"/></clipPath>
    <linearGradient id="bearG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e4c78d"/><stop offset="50%" stop-color="#c99c57"/>
      <stop offset="100%" stop-color="#a87c36"/></linearGradient>
  </defs>
  <g fill="#7b7c6a" stroke="#7b7c6a" stroke-width="3.75" stroke-linejoin="round">
    <path d="${BEAR_EAR_L}"/><path d="${BEAR_EAR_R}"/>${BEAR_LEGS}<path d="${BEAR_BODY}"/></g>
  <g fill="#7a5530" stroke="#3d2712" stroke-width="1.75">
    <path d="${BEAR_EAR_L}"/><path d="${BEAR_EAR_R}"/></g>
  <ellipse cx="20.2" cy="16.2" rx="4.6" ry="4.9" fill="#4a2f16"/>
  <ellipse cx="79.8" cy="16.2" rx="4.6" ry="4.9" fill="#4a2f16"/>
  <g fill="#3d2a18" stroke="#3d2712" stroke-width="1.75">${BEAR_LEGS}</g>
  <path d="${BEAR_BODY}" fill="url(#bearG)" stroke="#3d2712" stroke-width="1.75"/>
  <g clip-path="url(#bearBodyClip)">
    <path d="M10 58 L21 58 Q50 70 79 58 L90 58 L90 96 L10 96 Z" fill="#5d4424"/>
    <path d="M21 58 Q50 70 79 58" fill="none" stroke="#3d2712" stroke-width="1.75"/>
    <ellipse cx="50" cy="74" rx="15" ry="8.5" fill="#8a6437"/></g>
  <path class="bear-eye" d="M27 40.5 Q38.5 37.1 41 48.7 Q29.5 52.1 27 40.5 Z" fill="#2c2442"/>
  <path class="bear-eye" d="M73 40.5 Q61.5 37.1 59 48.7 Q70.5 52.1 73 40.5 Z" fill="#2c2442"/>
  <circle class="bear-eye" cx="34.3" cy="44.9" r="2.7" fill="#d8451c"/>
  <circle class="bear-eye" cx="65.7" cy="44.9" r="2.7" fill="#d8451c"/>
  <ellipse cx="50" cy="55" rx="3.8" ry="2.7" fill="#3a2410"/>
  <path d="M50 57.7 Q50 61.7 46 61.7 M50 57.7 Q50 61.7 54 61.7" stroke="#3a2410" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  { cy: 90, rx: 27, ry: 6 });

const tombstone = svg(`
  <ellipse cx="50" cy="85" rx="27" ry="7" fill="#3f6a24"/>
  <path d="M30 85 L30 48 Q30 24 50 24 Q70 24 70 48 L70 85 Z" fill="#bcbcbc" stroke="#5c5c5c" stroke-width="3"/>
  <circle cx="50" cy="49" r="10" fill="#8f8f8f"/>
  <circle cx="46" cy="48" r="2.6" fill="#5a5a5a"/><circle cx="54" cy="48" r="2.6" fill="#5a5a5a"/>
  <path d="M47 55 L53 55 L51 61 L49 61 Z" fill="#5a5a5a"/>
  <g stroke="#8f8f8f" stroke-width="4" stroke-linecap="round">
    <line x1="41" y1="66" x2="59" y2="72"/><line x1="59" y1="66" x2="41" y2="72"/></g>`, { cy: 89, rx: 24, ry: 5.5 });

// --- tomb chain ---------------------------------------------------------

const church = svg(`
  <rect x="30" y="46" width="40" height="40" fill="#e4ddc6" stroke="#4a4636" stroke-width="3"/>
  <path d="M26 48 L50 28 L74 48 Z" fill="#7d5a86" stroke="#3a2f42" stroke-width="3" stroke-linejoin="round"/>
  <rect x="47" y="12" width="6" height="18" fill="#caa02c"/>
  <rect x="42" y="17" width="16" height="6" fill="#caa02c"/>
  <path d="M43 86 L43 62 Q50 54 57 62 L57 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="52" r="5" fill="#8fbcd8" stroke="#4a4636" stroke-width="2"/>`, { cy: 89, rx: 24, ry: 5.5 });

const cathedral = svg(`
  <rect x="24" y="46" width="52" height="40" fill="#e4ddc6" stroke="#4a4636" stroke-width="3"/>
  <path d="M24 46 L34 22 L44 46 Z" fill="#6f4f78" stroke="#3a2f42" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M56 46 L66 22 L76 46 Z" fill="#6f4f78" stroke="#3a2f42" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="31" y="14" width="5" height="9" fill="#caa02c"/><rect x="63" y="14" width="5" height="9" fill="#caa02c"/>
  <path d="M42 86 L42 60 Q50 52 58 60 L58 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="40" r="7" fill="#8fbcd8" stroke="#4a4636" stroke-width="2"/>`, { cy: 89, rx: 28, ry: 6.5 });

const treasury = svg(`
  <rect x="26" y="52" width="48" height="34" rx="4" fill="#7a5324" stroke="#3f2c12" stroke-width="3"/>
  <path d="M26 52 Q50 34 74 52 Z" fill="#8a5f2b" stroke="#3f2c12" stroke-width="3"/>
  <rect x="24" y="60" width="52" height="7" fill="#caa02c" stroke="#7a5c12" stroke-width="2"/>
  <rect x="46" y="60" width="8" height="14" fill="#e8c14a" stroke="#7a5c12" stroke-width="2"/>
  <g fill="#f4d768" stroke="#7a5c12" stroke-width="1.5">
    <circle cx="36" cy="46" r="6"/><circle cx="50" cy="42" r="6"/><circle cx="63" cy="46" r="6"/></g>`, { cy: 89, rx: 28, ry: 6.5 });

// --- storehouse ---------------------------------------------------------

// A 3D wooden plate/dish (shown in the empty storehouse). Rim catches light on
// top; the well is recessed and darker; a thickness band sits under the rim.
const plate = svg(`
  <defs>
    <linearGradient id="plateRim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b9803f"/><stop offset="100%" stop-color="#7c4c1f"/></linearGradient>
    <radialGradient id="plateWell" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#6d4620"/><stop offset="100%" stop-color="#472a12"/></radialGradient>
  </defs>
  <ellipse cx="50" cy="60" rx="40" ry="22" fill="#563619"/>
  <ellipse cx="50" cy="54" rx="40" ry="22" fill="url(#plateRim)" stroke="#37200d" stroke-width="3"/>
  <ellipse cx="50" cy="53" rx="25" ry="12.5" fill="url(#plateWell)" stroke="#3f2610" stroke-width="2"/>
  <path d="M32 47 Q42 42 55 44" fill="none" stroke="#d69a58" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`);

// --- crystal (wildcard) & rock ------------------------------------------

// A faceted blue gem (the wildcard piece).
const crystal = svg(`
  <polygon points="50,10 71,38 61,84 39,84 29,38"
           fill="#8fcdf0" stroke="#255a80" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="50,10 71,38 50,46 29,38" fill="#c4e9fc"/>
  <polygon points="29,38 50,46 39,84" fill="#86c3ea"/>
  <polygon points="71,38 50,46 61,84" fill="#5a9bd0"/>
  <polygon points="50,46 61,84 39,84" fill="#74b6e4"/>
  <polygon points="50,15 61,36 50,43 42,36" fill="#eafaff" opacity="0.75"/>
  <line x1="50" y1="46" x2="50" y2="82" stroke="#3f78a0" stroke-width="1.6" opacity="0.5"/>`,
  { cy: 90, rx: 18, ry: 5 });

// A gray boulder (what a crystal becomes when it can't complete a match).
const rock = svg(`
  <path d="M20 74 Q14 58 25 50 Q33 40 48 42 Q64 40 74 51 Q84 60 79 74 Q50 82 20 74 Z"
        fill="#8f8f8f" stroke="#474747" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="41" cy="53" rx="10" ry="6" fill="#a9a9a9" opacity="0.65"/>
  <path d="M30 62 Q42 57 55 60 Q64 62 70 58" fill="none" stroke="#6c6c6c" stroke-width="2.4" stroke-linecap="round"/>`,
  { cy: 80, rx: 27, ry: 6 });

export const SPRITES = {
  grass, bush, tree, hut, house, mansion, castle, floatingCastle, tripleCastle,
  bear, tombstone, church, cathedral, treasury, plate, crystal, rock,
};

// --- "super" variants (made by matching 4+) ----------------------------------
// A super piece is its regular sprite plus a small decoration — the regular
// sprites above are NOT modified. Plants get red berries (per the original);
// everything else gets a gold-star "super" badge (placeholder until real art).
const SUPER_BERRIES =
  '<g stroke="#7c1616" stroke-width="1.1">' +
  '<circle cx="63" cy="30" r="5.4" fill="#e23b3b"/>' +
  '<circle cx="73" cy="36" r="4.8" fill="#d33030"/>' +
  '<circle cx="60" cy="40" r="4.4" fill="#ec4a4a"/></g>';
const SUPER_STAR =
  '<path d="M73 11 l2.7 5.6 6.2 .8 -4.6 4.3 1.2 6.1 -5.5-3-5.5 3 1.2-6.1-4.6-4.3 6.2-.8 z" ' +
  'fill="#ffd84a" stroke="#a9790f" stroke-width="1"/>';
const SUPER_BASES = ['bush', 'tree', 'hut', 'house', 'mansion', 'castle',
  'floatingCastle', 'tripleCastle', 'church', 'cathedral', 'treasury'];
const PLANT_SUPERS = new Set(['bush', 'tree']);
for (const base of SUPER_BASES) {
  const decor = PLANT_SUPERS.has(base) ? SUPER_BERRIES : SUPER_STAR;
  SPRITES[base + 'Super'] = SPRITES[base].replace('</svg>', decor + '</svg>');
}
