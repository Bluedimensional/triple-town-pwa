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
  `<ellipse class="pc-shadow" cx="50" cy="${(cy + 2).toFixed(1)}" rx="${(rx * 1.24).toFixed(1)}" ry="${(ry * 1.28).toFixed(1)}" fill="#081405" opacity="0.34"/>` +
  `<ellipse class="pc-shadow" cx="50" cy="${(cy + 2).toFixed(1)}" rx="${(rx * 0.82).toFixed(1)}" ry="${(ry * 1.02).toFixed(1)}" fill="#040c02" opacity="0.4"/>`;

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
  <path d="M17 63 L19 47 L24 28 L28 45 L33 32 L37 44 L42 26 L47 43 L51 30
           L55 44 L60 27 L65 43 L69 31 L74 46 L79 50 L82 63
           C84 71 80 75.2 72 75.8 C60 77 40 77 28 75.8
           C20 75.2 16 71 17 63 Z"
        fill="url(#grassG)" stroke="#11290a" stroke-width="2.6" stroke-linejoin="round"/>
  <g stroke="#193c0e" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.7">
    <path d="M31 66 L33 43"/><path d="M42 68 L43 33"/><path d="M52 66 L53 40"/>
    <path d="M62 67 L62 36"/><path d="M71 66 L71 46"/></g>
  <g stroke="#d9f083" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.45">
    <path d="M24 40 L24 31"/><path d="M42 34 L42 29"/><path d="M60 36 L60 30"/></g>`, { cy: 76, rx: 27, ry: 6.5 });

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

// Tree — full and healthy, matching the original: two big overlapping leaf
// masses (olive back, bright front) built from clustered lumps, coming down low
// over a short, fat, flared trunk. Each mass is stamped once fattened in the dark
// outline colour then filled, so the whole bumpy cluster gets one clean rim.
const tree = (() => {
  const clump = (circles, fill, spots, spotFill) => {
    const cs = circles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    const sp = spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    return `<g fill="#2f5613" stroke="#1c340b" stroke-width="3" stroke-linejoin="round">${cs}</g>`
      + `<g fill="${fill}">${cs}</g>`
      + `<g fill="${spotFill}" opacity="0.4">${sp}</g>`;
  };
  const back = [[50, 40, 21], [31, 35, 12], [45, 26, 13], [62, 28, 13], [73, 40, 12],
    [72, 53, 11], [29, 51, 12], [40, 59, 12], [61, 59, 12], [50, 61, 13]];
  const front = [[44, 55, 17], [30, 53, 10], [39, 45, 11], [54, 47, 11],
    [62, 55, 10], [53, 64, 11], [37, 63, 11]];
  const backSpots = [[37, 37, 4.2], [58, 42, 4.5], [48, 52, 4], [66, 48, 3.8], [33, 46, 3.6]];
  const frontSpots = [[39, 51, 3.8], [52, 55, 4], [45, 62, 3.6], [31, 57, 3]];
  return svg(
    '<path d="M42 62 Q39 74 33 89 Q50 93 67 89 Q61 74 58 62 Z" fill="#7a4a22" stroke="#29190b" stroke-width="3" stroke-linejoin="round"/>'
    + '<path d="M47 66 Q50 80 45 89" fill="none" stroke="#37210e" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>'
    + clump(back, '#a6b24c', backSpots, '#83903a')
    + clump(front, '#74b83c', frontSpots, '#4f8f2a'),
    { cy: 90, rx: 24, ry: 6 });
})();

// --- buildings ----------------------------------------------------------

const hut = svg(`
  <rect x="31" y="52" width="38" height="34" rx="3" fill="#a2412a" stroke="#291309" stroke-width="3"/>
  <g stroke="#491a11" stroke-width="2">
    <line x1="31" y1="63" x2="69" y2="63"/><line x1="31" y1="74" x2="69" y2="74"/>
    <line x1="50" y1="52" x2="50" y2="63"/><line x1="40" y1="63" x2="40" y2="74"/>
    <line x1="60" y1="63" x2="60" y2="74"/><line x1="45" y1="74" x2="45" y2="86"/></g>
  <path d="M23 54 L50 24 L77 54 Z" fill="#c98a3e" stroke="#291309" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 30 L68 50 L32 50 Z" fill="#db9f52" opacity="0.6"/>
  <path d="M44 86 L44 70 Q50 64 56 70 L56 86 Z" fill="#2a1610"/>`, { cy: 89, rx: 22, ry: 5.5 });

// House — Mediterranean villa: white stucco, terracotta roof, arched openings.
const house = svg(`
  <rect x="28" y="52" width="44" height="34" fill="#fbf4e6" stroke="#534023" stroke-width="3"/>
  <path d="M24 54 L50 35 L76 54 Z" fill="#d0763e" stroke="#492913" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#a85a2c" stroke-width="1.4"><line x1="39" y1="46" x2="36" y2="54"/><line x1="50" y1="41" x2="50" y2="54"/><line x1="61" y1="46" x2="64" y2="54"/></g>
  <path d="M44 86 L44 70 Q50 62 56 70 L56 86 Z" fill="#7a4a22" stroke="#534023" stroke-width="2"/>
  <path d="M31 73 L31 65 Q36 60 41 65 L41 73 Z" fill="#8fc0d8" stroke="#534023" stroke-width="2"/>
  <path d="M59 73 L59 65 Q64 60 69 65 L69 73 Z" fill="#8fc0d8" stroke="#534023" stroke-width="2"/>`, { cy: 89, rx: 26, ry: 6 });

// Mansion — a grander villa with a corner tower and an arched arcade.
// Mansion — a golden-tan villa (distinct from the white house), with a wider,
// centered second story.
const mansion = svg(`
  <rect x="18" y="48" width="60" height="38" fill="#e6d29a" stroke="#534023" stroke-width="3"/>
  <rect x="40" y="26" width="20" height="24" fill="#e6d29a" stroke="#534023" stroke-width="3"/>
  <rect x="16" y="44" width="64" height="5" fill="#d0763e" stroke="#492913" stroke-width="2"/>
  <path d="M37 27 L50 14 L63 27 Z" fill="#d0763e" stroke="#492913" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M46 40 L46 33 Q50 29 54 33 L54 40 Z" fill="#8fc0d8" stroke="#534023" stroke-width="2"/>
  <g fill="#8fc0d8" stroke="#534023" stroke-width="2"><rect x="22" y="53" width="9" height="8"/><rect x="65" y="53" width="9" height="8"/></g>
  <g fill="#7a4a22" stroke="#534023" stroke-width="2">
    <path d="M22 86 L22 69 Q27 63 32 69 L32 86 Z"/><path d="M64 86 L64 69 Q69 63 74 69 L74 86 Z"/></g>
  <path d="M43 86 L43 66 Q50 60 57 66 L57 86 Z" fill="#6a4020" stroke="#534023" stroke-width="2"/>`, { cy: 89, rx: 33, ry: 6.5 });

// Castle — gothic: pointed slate spires, a rose window, a portcullis gate, a flag.
const castle = svg(`
  <defs><linearGradient id="castleG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#bdb8a6"/><stop offset="100%" stop-color="#8b8674"/></linearGradient></defs>
  <rect x="18" y="46" width="15" height="40" fill="url(#castleG)" stroke="#22201a" stroke-width="3"/>
  <rect x="67" y="46" width="15" height="40" fill="url(#castleG)" stroke="#22201a" stroke-width="3"/>
  <rect x="34" y="40" width="32" height="46" fill="url(#castleG)" stroke="#22201a" stroke-width="3"/>
  <path d="M16 47 L25.5 24 L35 47 Z" fill="#553a5e" stroke="#18131d" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M65 47 L74.5 24 L84 47 Z" fill="#553a5e" stroke="#18131d" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M32 41 L50 12 L68 41 Z" fill="#5f4268" stroke="#18131d" stroke-width="3" stroke-linejoin="round"/>
  <line x1="50" y1="12" x2="50" y2="5" stroke="#18131d" stroke-width="2"/><path d="M50 5 L59 8 L50 11 Z" fill="#b5462e"/>
  <circle cx="50" cy="34" r="5" fill="#7bb0cf" stroke="#22201a" stroke-width="2"/>
  <path d="M42 86 L42 62 Q50 52 58 62 L58 86 Z" fill="#2c281f" stroke="#22201a" stroke-width="2"/>
  <g stroke="#6a6456" stroke-width="1.2"><line x1="46" y1="58" x2="46" y2="86"/><line x1="50" y1="55" x2="50" y2="86"/><line x1="54" y1="58" x2="54" y2="86"/><line x1="43" y1="66" x2="57" y2="66"/><line x1="43" y1="76" x2="57" y2="76"/></g>
  <path d="M22 62 L22 55 Q25.5 51 29 55 L29 62 Z" fill="#f0d878"/>
  <path d="M71 62 L71 55 Q74.5 51 78 55 L78 62 Z" fill="#f0d878"/>`, { cy: 89, rx: 30, ry: 6.5 });

// A floating island (cloud + rock spike) shared by the Floating & Triple Castle,
// so both read as grander, elevated structures.
const FLOAT_BASE =
  '<path d="M37 79 L50 93 L63 79 Q50 83 37 79 Z" fill="#6a6478" stroke="#26232c" stroke-width="2" stroke-linejoin="round"/>'
  + '<g fill="#eef3fb" stroke="#c3cde0" stroke-width="1.5">'
  + '<ellipse cx="50" cy="78" rx="30" ry="8.5"/><ellipse cx="31" cy="76" rx="13" ry="8"/>'
  + '<ellipse cx="69" cy="76" rx="13" ry="8"/><ellipse cx="50" cy="74" rx="17" ry="9"/></g>';

// Floating Castle — a tall silver-and-blue keep with three spires, on the island.
const floatingCastle = svg(`
  <defs>
    <linearGradient id="fcW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f2f5fb"/><stop offset="100%" stop-color="#b7c1db"/></linearGradient>
    <radialGradient id="fcGlow" cx="50%" cy="36%" r="56%"><stop offset="0%" stop-color="#bcd4ff" stop-opacity="0.5"/><stop offset="100%" stop-color="#bcd4ff" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="50" cy="38" rx="46" ry="42" fill="url(#fcGlow)"/>
  ${FLOAT_BASE}
  <rect x="20" y="44" width="13" height="30" fill="url(#fcW)" stroke="#363c4f" stroke-width="3"/>
  <rect x="67" y="44" width="13" height="30" fill="url(#fcW)" stroke="#363c4f" stroke-width="3"/>
  <rect x="37" y="28" width="26" height="46" fill="url(#fcW)" stroke="#363c4f" stroke-width="3"/>
  <path d="M18 45 L26.5 15 L35 45 Z" fill="#4a6fb0" stroke="#1c2b49" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M65 45 L73.5 15 L82 45 Z" fill="#4a6fb0" stroke="#1c2b49" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M35 29 L50 3 L65 29 Z" fill="#3f61a4" stroke="#192844" stroke-width="3" stroke-linejoin="round"/>
  <line x1="50" y1="3" x2="50" y2="-1" stroke="#192844" stroke-width="2"/><path d="M50 -1 L58 1.5 L50 4 Z" fill="#8fd0ec"/>
  <circle cx="50" cy="38" r="4.6" fill="#8fd0ec" stroke="#363c4f" stroke-width="2"/>
  <g fill="#dfe8f7"><rect x="24" y="52" width="6" height="8" rx="1"/><rect x="70" y="52" width="6" height="8" rx="1"/></g>
  <path d="M43 74 L43 52 Q50 44 57 52 L57 74 Z" fill="#5a6484" stroke="#262c3e" stroke-width="2"/>`,
  { cy: 90, rx: 31, ry: 6 });

// Triple Castle — a tall gold keep crowned with a star, on the same island.
const tripleCastle = svg(`
  <defs><linearGradient id="tcW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe487"/><stop offset="100%" stop-color="#d6a12c"/></linearGradient></defs>
  ${FLOAT_BASE}
  <rect x="18" y="46" width="15" height="28" fill="url(#tcW)" stroke="#49360b" stroke-width="3"/>
  <rect x="67" y="46" width="15" height="28" fill="url(#tcW)" stroke="#49360b" stroke-width="3"/>
  <rect x="36" y="26" width="28" height="48" fill="url(#tcW)" stroke="#49360b" stroke-width="3"/>
  <g fill="url(#tcW)" stroke="#49360b" stroke-width="2">
    <rect x="18" y="42" width="5" height="5"/><rect x="28" y="42" width="5" height="5"/>
    <rect x="67" y="42" width="5" height="5"/><rect x="77" y="42" width="5" height="5"/>
    <rect x="36" y="22" width="6" height="5"/><rect x="47" y="22" width="6" height="5"/><rect x="58" y="22" width="6" height="5"/></g>
  <path d="M50 1 L54.4 13 L67 13 L56.8 20.6 L60.8 32.6 L50 25 L39.2 32.6 L43.2 20.6 L33 13 L45.6 13 Z" fill="#ffe07a" stroke="#795c12" stroke-width="1.5" stroke-linejoin="round"/>
  <g fill="#fff2b0"><rect x="23" y="54" width="6" height="8" rx="1"/><rect x="71" y="54" width="6" height="8" rx="1"/></g>
  <path d="M43 74 L43 52 Q50 44 57 52 L57 74 Z" fill="#7a5a12" stroke="#36280a" stroke-width="2"/>
  <path d="M47 74 L47 54 Q50 49 53 54 L53 74 Z" fill="#3a2a08"/>`,
  { cy: 90, rx: 32, ry: 6 });

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
// Width sits about a quarter of the way from the v36 midpoint back toward the
// pre-fattening bear — slimmer than v36, still chunkier than the original.
const BEAR_EAR_L = 'M14 22 C13.7 15.75 15.05 11.25 17.1 9.2 C19.15 10.85 22.45 9.6 25.3 10.85 '
  + 'C30.25 12.9 32.5 16.6 32.5 21.55 C32.5 27.3 28.2 28.625 23.25 28.625 C17.5 28.625 14.4 26.1 14 22 Z';
const BEAR_EAR_R = 'M86 22 C86.3 15.75 84.95 11.25 82.9 9.2 C80.85 10.85 77.55 9.6 74.7 10.85 '
  + 'C69.75 12.9 67.5 16.6 67.5 21.55 C67.5 27.3 71.8 28.625 76.75 28.625 C82.5 28.625 85.6 26.1 86 22 Z';
const BEAR_BODY = 'M17 35.75 C17 24.5 22.1 19.1 34.5 19.1 L65.5 19.1 C77.9 19.1 83 24.5 83 35.75 '
  + 'L80 70.25 C80 80.5 75.4 84.6 65.5 84.6 L34.5 84.6 C24.6 84.6 20 80.5 20 70.25 Z';
const BEAR_LEGS =
  '<rect x="25" y="81.5" width="10.5" height="11.5" rx="3"/><rect x="37.6" y="81.5" width="10.5" height="11.5" rx="3"/>'
  + '<rect x="51.9" y="81.5" width="10.5" height="11.5" rx="3"/><rect x="64.5" y="81.5" width="10.5" height="11.5" rx="3"/>';

const bear = svg(`
  <defs>
    <clipPath id="bearBodyClip"><path d="${BEAR_BODY}"/></clipPath>
    <linearGradient id="bearG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e4c78d"/><stop offset="50%" stop-color="#c99c57"/>
      <stop offset="100%" stop-color="#a87c36"/></linearGradient>
  </defs>
  <g fill="#7b7c6a" stroke="#4a4a40" stroke-width="3.75" stroke-linejoin="round">
    <path d="${BEAR_EAR_L}"/><path d="${BEAR_EAR_R}"/>${BEAR_LEGS}<path d="${BEAR_BODY}"/></g>
  <g fill="#7a5530" stroke="#25170b" stroke-width="1.75">
    <path d="${BEAR_EAR_L}"/><path d="${BEAR_EAR_R}"/></g>
  <ellipse cx="22" cy="16.4" rx="4.6" ry="4.9" fill="#4a2f16"/>
  <ellipse cx="78" cy="16.4" rx="4.6" ry="4.9" fill="#4a2f16"/>
  <g fill="#3d2a18" stroke="#25170b" stroke-width="1.75">${BEAR_LEGS}</g>
  <path d="${BEAR_BODY}" fill="url(#bearG)" stroke="#25170b" stroke-width="1.75"/>
  <g clip-path="url(#bearBodyClip)">
    <path d="M10 58 L21 58 Q50 70 79 58 L90 58 L90 96 L10 96 Z" fill="#5d4424"/>
    <path d="M21 58 Q50 70 79 58" fill="none" stroke="#25170b" stroke-width="1.75"/>
    <ellipse cx="50" cy="74" rx="15" ry="8.5" fill="#8a6437"/></g>
  <path class="bear-eye" d="M28.25 40.5 Q39.5 37.2 42 48.6 Q30.75 51.9 28.25 40.5 Z" fill="#2c2442"/>
  <path class="bear-eye" d="M71.75 40.5 Q60.5 37.2 58 48.6 Q69.25 51.9 71.75 40.5 Z" fill="#2c2442"/>
  <circle class="bear-eye" cx="35.4" cy="44.85" r="2.65" fill="#d8451c"/>
  <circle class="bear-eye" cx="64.6" cy="44.85" r="2.65" fill="#d8451c"/>
  <ellipse cx="50" cy="55" rx="3.8" ry="2.7" fill="#3a2410"/>
  <path d="M50 57.7 Q50 61.7 46 61.7 M50 57.7 Q50 61.7 54 61.7" stroke="#23160a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  { cy: 90, rx: 24.5, ry: 6 });

const tombstone = svg(`
  <ellipse cx="50" cy="85" rx="27" ry="7" fill="#3f6a24"/>
  <path d="M30 85 L30 48 Q30 24 50 24 Q70 24 70 48 L70 85 Z" fill="#bcbcbc" stroke="#373737" stroke-width="3"/>
  <circle cx="50" cy="49" r="10" fill="#8f8f8f"/>
  <circle cx="46" cy="48" r="2.6" fill="#5a5a5a"/><circle cx="54" cy="48" r="2.6" fill="#5a5a5a"/>
  <path d="M47 55 L53 55 L51 61 L49 61 Z" fill="#5a5a5a"/>
  <g stroke="#8f8f8f" stroke-width="4" stroke-linecap="round">
    <line x1="41" y1="66" x2="59" y2="72"/><line x1="59" y1="66" x2="41" y2="72"/></g>`, { cy: 89, rx: 24, ry: 5.5 });

// --- tomb chain ---------------------------------------------------------

const church = svg(`
  <rect x="30" y="46" width="40" height="40" fill="#a3a29a" stroke="#292924" stroke-width="3"/>
  <path d="M26 48 L50 28 L74 48 Z" fill="#7d5a86" stroke="#231c28" stroke-width="3" stroke-linejoin="round"/>
  <rect x="47" y="12" width="6" height="18" fill="#caa02c"/>
  <rect x="42" y="17" width="16" height="6" fill="#caa02c"/>
  <path d="M43 86 L43 62 Q50 54 57 62 L57 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="52" r="5" fill="#8fbcd8" stroke="#2c2a20" stroke-width="2"/>`, { cy: 89, rx: 24, ry: 5.5 });

const cathedral = svg(`
  <rect x="24" y="46" width="52" height="40" fill="#a3a29a" stroke="#292924" stroke-width="3"/>
  <path d="M24 46 L34 22 L44 46 Z" fill="#6f4f78" stroke="#231c28" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M56 46 L66 22 L76 46 Z" fill="#6f4f78" stroke="#231c28" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="31" y="14" width="5" height="9" fill="#caa02c"/><rect x="63" y="14" width="5" height="9" fill="#caa02c"/>
  <path d="M42 86 L42 60 Q50 52 58 60 L58 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="40" r="7" fill="#8fbcd8" stroke="#2c2a20" stroke-width="2"/>`, { cy: 89, rx: 28, ry: 6.5 });

const treasury = svg(`
  <rect x="26" y="52" width="48" height="34" rx="4" fill="#7a5324" stroke="#261a0b" stroke-width="3"/>
  <path d="M26 52 Q50 34 74 52 Z" fill="#8a5f2b" stroke="#261a0b" stroke-width="3"/>
  <rect x="24" y="60" width="52" height="7" fill="#caa02c" stroke="#49370b" stroke-width="2"/>
  <rect x="46" y="60" width="8" height="14" fill="#e8c14a" stroke="#49370b" stroke-width="2"/>
  <g fill="#f4d768" stroke="#49370b" stroke-width="1.5">
    <circle cx="36" cy="46" r="6"/><circle cx="50" cy="42" r="6"/><circle cx="63" cy="46" r="6"/></g>`, { cy: 89, rx: 28, ry: 6.5 });

// Royal Vault — the tier above Treasury: a grand gold chest crowned and
// overflowing with coins and gems.
const royalVault = svg(`
  <defs>
    <linearGradient id="rvChest" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a9791f"/><stop offset="100%" stop-color="#6e4d12"/></linearGradient>
    <linearGradient id="rvGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffe487"/><stop offset="100%" stop-color="#d6a12c"/></linearGradient>
  </defs>
  <g fill="url(#rvGold)" stroke="#49370b" stroke-width="1.3">
    <circle cx="26" cy="49" r="6.5"/><circle cx="37" cy="43" r="6.5"/><circle cx="50" cy="40" r="7"/>
    <circle cx="63" cy="43" r="6.5"/><circle cx="74" cy="49" r="6"/><circle cx="44" cy="47" r="4.6"/><circle cx="57" cy="47" r="4.6"/></g>
  <path d="M40 30 L44 20 L50 27 L56 20 L60 30 Z" fill="#ffd94d" stroke="#654909" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="50" cy="24" r="2.2" fill="#e34b8a"/>
  <rect x="18" y="54" width="64" height="32" rx="5" fill="url(#rvChest)" stroke="#261a0b" stroke-width="3"/>
  <path d="M18 55 Q50 40 82 55 Z" fill="#8a5f2b" stroke="#261a0b" stroke-width="3"/>
  <rect x="16" y="62" width="68" height="8" fill="url(#rvGold)" stroke="#49370b" stroke-width="2"/>
  <rect x="45" y="62" width="10" height="16" rx="2" fill="#ffe07a" stroke="#49370b" stroke-width="2"/>
  <g stroke="#49370b" stroke-width="1"><circle cx="29" cy="49" r="2.3" fill="#e34b8a"/><circle cx="71" cy="49" r="2.3" fill="#4a9be0"/></g>`,
  { cy: 89, rx: 31, ry: 6.5 });

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
  <ellipse cx="50" cy="54" rx="40" ry="22" fill="url(#plateRim)" stroke="#211308" stroke-width="3"/>
  <ellipse cx="50" cy="53" rx="25" ry="12.5" fill="url(#plateWell)" stroke="#26170a" stroke-width="2"/>
  <path d="M32 47 Q42 42 55 44" fill="none" stroke="#d69a58" stroke-width="3" stroke-linecap="round" opacity="0.55"/>`);

// --- crystal (wildcard) & rock ------------------------------------------

// A faceted blue gem (the wildcard piece).
// Crystal (wildcard) — drawn to match the original: a tall icy faceted shard
// with a bright highlight, standing on a small grassy mound with a rock at the base.
const crystal = svg(`
  <defs>
    <linearGradient id="crysB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f7fcff"/><stop offset="52%" stop-color="#d4edf9"/>
      <stop offset="100%" stop-color="#a6d0e8"/></linearGradient>
    <linearGradient id="crysG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6aa63a"/><stop offset="100%" stop-color="#3d7020"/></linearGradient>
  </defs>
  <ellipse cx="50" cy="80" rx="22" ry="9" fill="url(#crysG)" stroke="#1c340d" stroke-width="2.5"/>
  <g fill="#5f9433"><path d="M31 76 l1 -6 3 5 z"/><path d="M40 78 l1 -5 2 5 z"/><path d="M66 75 l1 -6 3 6 z"/></g>
  <path d="M39 87 Q42 80 50 81 Q60 80 61 86 Q52 90 42 89 Z" fill="#4c4b46" stroke="#1a1917" stroke-width="2"/>
  <path d="M50 15 L65 43 L62 70 L56 76 L44 76 L38 70 L35 43 Z" fill="url(#crysB)" stroke="#2e4756" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M50 35 L65 43 L62 70 L56 76 L50 76 Z" fill="#7fb2cf" opacity="0.28"/>
  <path d="M50 15 L65 43 L50 35 Z" fill="#7fb2cf" opacity="0.16"/>
  <g stroke="#8fbfda" stroke-width="1.5" fill="none"><path d="M50 15 L50 76"/><path d="M35 43 L50 35 L65 43"/></g>
  <path d="M43 39 L46 40 L44.5 66 L42 59 Z" fill="#ffffff" opacity="0.55"/>
  <path d="M59 27 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z" fill="#ffffff"/>`,
  { cy: 90, rx: 22, ry: 6 });

// A gray boulder (what a crystal becomes when it can't complete a match).
const rock = svg(`
  <path d="M20 74 Q14 58 25 50 Q33 40 48 42 Q64 40 74 51 Q84 60 79 74 Q50 82 20 74 Z"
        fill="#8f8f8f" stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="41" cy="53" rx="10" ry="6" fill="#a9a9a9" opacity="0.65"/>
  <path d="M30 62 Q42 57 55 60 Q64 62 70 58" fill="none" stroke="#414141" stroke-width="2.4" stroke-linecap="round"/>`,
  { cy: 80, rx: 27, ry: 6 });

// Mega Castle — the tier above Triple Castle: a big golden fortress with three
// towers, red conical roofs + flags, a crown gem, and a grand gate.
const megaCastle = svg(`
  <defs><linearGradient id="megaG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffe487"/><stop offset="100%" stop-color="#d6a12c"/></linearGradient></defs>
  <rect x="14" y="44" width="18" height="42" fill="url(#megaG)" stroke="#49360b" stroke-width="3"/>
  <rect x="68" y="44" width="18" height="42" fill="url(#megaG)" stroke="#49360b" stroke-width="3"/>
  <rect x="34" y="34" width="32" height="52" fill="url(#megaG)" stroke="#49360b" stroke-width="3"/>
  <g fill="url(#megaG)" stroke="#49360b" stroke-width="2">
    <rect x="14" y="40" width="5" height="5"/><rect x="27" y="40" width="5" height="5"/>
    <rect x="68" y="40" width="5" height="5"/><rect x="81" y="40" width="5" height="5"/></g>
  <path d="M12 45 L23 24 L34 45 Z" fill="#c0392b" stroke="#42130d" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M66 45 L77 24 L88 45 Z" fill="#c0392b" stroke="#42130d" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M32 35 L50 10 L68 35 Z" fill="#c0392b" stroke="#42130d" stroke-width="3" stroke-linejoin="round"/>
  <line x1="50" y1="10" x2="50" y2="3" stroke="#42130d" stroke-width="2"/><path d="M50 3 L60 6 L50 9 Z" fill="#ffd34d"/>
  <circle cx="50" cy="29" r="4.6" fill="#e34b8a" stroke="#49360b" stroke-width="1.6"/>
  <g fill="#fff2b0"><rect x="19" y="54" width="7" height="9" rx="1"/><rect x="74" y="54" width="7" height="9" rx="1"/></g>
  <path d="M42 86 L42 60 Q50 50 58 60 L58 86 Z" fill="#7a5a12" stroke="#36280a" stroke-width="2"/>
  <path d="M46 86 L46 62 Q50 56 54 62 L54 86 Z" fill="#3a2a08"/>`,
  { cy: 90, rx: 33, ry: 6.5 });

// Kingdom — the ultimate tier: a grand golden palace with domed towers, a crown
// on top, gem accents, and a soft radiant glow.
const kingdom = svg(`
  <defs>
    <linearGradient id="kingG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff0a8"/><stop offset="100%" stop-color="#e0ac33"/></linearGradient>
    <radialGradient id="kingGlow" cx="50%" cy="42%" r="58%">
      <stop offset="0%" stop-color="#fff4c0" stop-opacity="0.5"/><stop offset="100%" stop-color="#fff4c0" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="50" cy="46" rx="47" ry="43" fill="url(#kingGlow)"/>
  <rect x="12" y="52" width="76" height="34" fill="url(#kingG)" stroke="#49360b" stroke-width="3"/>
  <rect x="12" y="40" width="14" height="46" fill="url(#kingG)" stroke="#49360b" stroke-width="3"/>
  <rect x="74" y="40" width="14" height="46" fill="url(#kingG)" stroke="#49360b" stroke-width="3"/>
  <rect x="38" y="30" width="24" height="56" fill="url(#kingG)" stroke="#49360b" stroke-width="3"/>
  <path d="M12 41 Q19 26 26 41 Z" fill="#e8b73a" stroke="#49360b" stroke-width="2"/>
  <path d="M74 41 Q81 26 88 41 Z" fill="#e8b73a" stroke="#49360b" stroke-width="2"/>
  <path d="M38 31 Q50 8 62 31 Z" fill="#e8b73a" stroke="#49360b" stroke-width="2.5"/>
  <path d="M42 16 L44 9 L47 14 L50 6 L53 14 L56 9 L58 16 Z" fill="#ffd94d" stroke="#49360b" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="50" cy="12.5" r="1.8" fill="#e34b8a"/>
  <g fill="#e34b8a" stroke="#49360b" stroke-width="1"><circle cx="19" cy="34" r="2.4"/><circle cx="81" cy="34" r="2.4"/></g>
  <g fill="#fff2b0"><rect x="15" y="58" width="8" height="10" rx="1"/><rect x="77" y="58" width="8" height="10" rx="1"/></g>
  <path d="M42 86 L42 58 Q50 48 58 58 L58 86 Z" fill="#7a5a12" stroke="#36280a" stroke-width="2"/>
  <path d="M46 86 L46 60 Q50 54 54 60 L54 86 Z" fill="#3a2a08"/>`,
  { cy: 90, rx: 35, ry: 7 });

export const SPRITES = {
  grass, bush, tree, hut, house, mansion, castle, floatingCastle, tripleCastle,
  megaCastle, kingdom,
  bear, tombstone, church, cathedral, treasury, royalVault, plate, crystal, rock,
};

// --- "super" variants (made by matching 4+) ----------------------------------
// A super piece is its regular sprite plus a small decoration — the regular
// sprites above are NOT modified. Plants get red berries (per the original);
// everything else gets a gold-star "super" badge (placeholder until real art).
const SUPER_BERRIES =
  '<g stroke="#4a0d0d" stroke-width="1.1">' +
  '<circle cx="63" cy="30" r="5.4" fill="#e23b3b"/>' +
  '<circle cx="73" cy="36" r="4.8" fill="#d33030"/>' +
  '<circle cx="60" cy="40" r="4.4" fill="#ec4a4a"/></g>';
const SUPER_STAR =
  '<path d="M73 11 l2.7 5.6 6.2 .8 -4.6 4.3 1.2 6.1 -5.5-3-5.5 3 1.2-6.1-4.6-4.3 6.2-.8 z" ' +
  'fill="#ffd84a" stroke="#654909" stroke-width="1"/>';
const SUPER_BASES = ['bush', 'tree', 'hut', 'house', 'mansion', 'castle',
  'floatingCastle', 'tripleCastle', 'megaCastle', 'kingdom',
  'church', 'cathedral', 'treasury', 'royalVault'];
const PLANT_SUPERS = new Set(['bush', 'tree']);
for (const base of SUPER_BASES) {
  const decor = PLANT_SUPERS.has(base) ? SUPER_BERRIES : SUPER_STAR;
  SPRITES[base + 'Super'] = SPRITES[base].replace('</svg>', decor + '</svg>');
}
