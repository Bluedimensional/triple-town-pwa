// sprites.js — hand-drawn SVG tile art, keyed by tile type.
//
// This is the swappable asset map (vector edition). Each entry is a self-
// contained SVG string on a 0..100 canvas. To swap in different art, replace
// a string here; nothing in the game logic depends on how a tile looks.
//
// Gradient ids are unique per sprite type so multiple sprites on the page
// don't collide when injected into the document.

const svg = (inner) =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

// --- plants -------------------------------------------------------------

// A low, wide patch of grass (a flat clump, not upright blades).
const grass = svg(`
  <ellipse cx="50" cy="74" rx="31" ry="8" fill="#2f5a1a" opacity="0.45"/>
  <path d="M17 73 Q15 57 29 55 Q33 45 43 51 Q50 43 58 51 Q68 45 72 55 Q85 57 83 73 Z"
        fill="#4d8d28" stroke="#234d13" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 66 Q26 60 33 63 Q40 58 47 63 Q54 58 61 63 Q68 59 78 65"
        fill="none" stroke="#3a7020" stroke-width="2.4" stroke-linecap="round"/>
  <g stroke="#356b1c" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M31 65 Q30 55 33 49"/><path d="M43 67 Q42 54 45 46"/>
    <path d="M54 66 Q54 53 57 47"/><path d="M65 65 Q65 55 69 51"/></g>
  <g stroke="#67b53a" stroke-width="2.3" stroke-linecap="round" fill="none">
    <path d="M37 66 Q37 57 39 51"/><path d="M49 67 Q50 55 52 49"/>
    <path d="M60 66 Q61 56 63 50"/></g>`);

const bush = svg(`
  <defs><radialGradient id="bushG" cx="40%" cy="32%" r="72%">
    <stop offset="0%" stop-color="#7cc047"/><stop offset="62%" stop-color="#4d8a29"/>
    <stop offset="100%" stop-color="#3a7020"/></radialGradient></defs>
  <circle cx="50" cy="52" r="37" fill="#274c14"/>
  <circle cx="50" cy="50" r="35" fill="url(#bushG)"/>
  <g fill="#3b7a1f" opacity="0.65">
    <circle cx="37" cy="45" r="6.5"/><circle cx="61" cy="41" r="5"/>
    <circle cx="57" cy="61" r="7"/><circle cx="39" cy="62" r="5.5"/>
    <circle cx="50" cy="52" r="5"/><circle cx="68" cy="55" r="4.5"/></g>`);

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
  <g fill="#3f7a22" opacity="0.55"><circle cx="52" cy="35" r="4"/><circle cx="63" cy="44" r="4.5"/><circle cx="64" cy="34" r="3.5"/></g>`);

// --- buildings ----------------------------------------------------------

const hut = svg(`
  <rect x="31" y="52" width="38" height="34" rx="3" fill="#a2412a" stroke="#45200f" stroke-width="3"/>
  <g stroke="#7a2c1c" stroke-width="2">
    <line x1="31" y1="63" x2="69" y2="63"/><line x1="31" y1="74" x2="69" y2="74"/>
    <line x1="50" y1="52" x2="50" y2="63"/><line x1="40" y1="63" x2="40" y2="74"/>
    <line x1="60" y1="63" x2="60" y2="74"/><line x1="45" y1="74" x2="45" y2="86"/></g>
  <path d="M23 54 L50 24 L77 54 Z" fill="#c98a3e" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 30 L68 50 L32 50 Z" fill="#db9f52" opacity="0.6"/>
  <path d="M44 86 L44 70 Q50 64 56 70 L56 86 Z" fill="#2a1610"/>`);

const house = svg(`
  <rect x="26" y="52" width="48" height="34" fill="#ecdcaa" stroke="#463516" stroke-width="3"/>
  <path d="M20 54 L50 26 L80 54 Z" fill="#b5462e" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <rect x="44" y="66" width="13" height="20" fill="#6a4423" stroke="#463516" stroke-width="2"/>
  <rect x="31" y="60" width="10" height="10" fill="#8fc0d8" stroke="#463516" stroke-width="2"/>
  <rect x="59" y="60" width="10" height="10" fill="#8fc0d8" stroke="#463516" stroke-width="2"/>`);

const mansion = svg(`
  <rect x="20" y="50" width="60" height="36" fill="#ecdcaa" stroke="#463516" stroke-width="3"/>
  <rect x="60" y="20" width="10" height="18" fill="#8a5a2b" stroke="#45200f" stroke-width="2"/>
  <path d="M16 52 L50 24 L84 52 Z" fill="#a53e28" stroke="#45200f" stroke-width="3" stroke-linejoin="round"/>
  <rect x="44" y="66" width="13" height="20" fill="#6a4423" stroke="#463516" stroke-width="2"/>
  <g fill="#8fc0d8" stroke="#463516" stroke-width="2">
    <rect x="26" y="58" width="9" height="9"/><rect x="65" y="58" width="9" height="9"/>
    <rect x="26" y="72" width="9" height="9"/><rect x="65" y="72" width="9" height="9"/></g>`);

const castle = svg(`
  <rect x="24" y="40" width="52" height="46" fill="#c9c4b0" stroke="#4a463a" stroke-width="3"/>
  <g fill="#c9c4b0" stroke="#4a463a" stroke-width="3">
    <rect x="24" y="30" width="11" height="14"/><rect x="44" y="30" width="12" height="14"/>
    <rect x="65" y="30" width="11" height="14"/></g>
  <rect x="42" y="62" width="16" height="24" fill="#5a5346"/>
  <path d="M42 62 Q50 54 58 62" fill="#5a5346"/>
  <g fill="#9a9484"><rect x="30" y="50" width="8" height="8"/><rect x="62" y="50" width="8" height="8"/></g>`);

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
  <rect x="42" y="64" width="16" height="24" fill="#7a5c12"/>`);

// --- bears & tombs ------------------------------------------------------

// Taller head with a big forehead, four legs, and blinking eyes (the .bear-eye
// class is animated in CSS).
const bear = svg(`
  <circle cx="31" cy="25" r="11" fill="#6f4a24" stroke="#3d2712" stroke-width="3"/>
  <circle cx="69" cy="25" r="11" fill="#6f4a24" stroke="#3d2712" stroke-width="3"/>
  <g fill="#5c3c1e" stroke="#3d2712" stroke-width="3">
    <rect x="28" y="82" width="9" height="11" rx="3"/><rect x="40" y="82" width="9" height="11" rx="3"/>
    <rect x="51" y="82" width="9" height="11" rx="3"/><rect x="63" y="82" width="9" height="11" rx="3"/></g>
  <rect x="25" y="19" width="50" height="67" rx="16" fill="#a06a34" stroke="#3d2712" stroke-width="3.5"/>
  <ellipse cx="50" cy="70" rx="15" ry="11" fill="#d8b483"/>
  <path d="M34 51 L45 55" stroke="#3d2712" stroke-width="3" stroke-linecap="round"/>
  <path d="M66 51 L55 55" stroke="#3d2712" stroke-width="3" stroke-linecap="round"/>
  <circle class="bear-eye" cx="41" cy="60" r="4" fill="#b5361f"/>
  <circle class="bear-eye" cx="59" cy="60" r="4" fill="#b5361f"/>
  <ellipse cx="50" cy="66" rx="4.2" ry="3" fill="#3a2410"/>
  <path d="M50 69 Q50 73 46 73 M50 69 Q50 73 54 73" stroke="#3a2410" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);

const tombstone = svg(`
  <ellipse cx="50" cy="85" rx="27" ry="7" fill="#3f6a24"/>
  <path d="M30 85 L30 48 Q30 24 50 24 Q70 24 70 48 L70 85 Z" fill="#bcbcbc" stroke="#5c5c5c" stroke-width="3"/>
  <circle cx="50" cy="49" r="10" fill="#8f8f8f"/>
  <circle cx="46" cy="48" r="2.6" fill="#5a5a5a"/><circle cx="54" cy="48" r="2.6" fill="#5a5a5a"/>
  <path d="M47 55 L53 55 L51 61 L49 61 Z" fill="#5a5a5a"/>
  <g stroke="#8f8f8f" stroke-width="4" stroke-linecap="round">
    <line x1="41" y1="66" x2="59" y2="72"/><line x1="59" y1="66" x2="41" y2="72"/></g>`);

// --- tomb chain ---------------------------------------------------------

const church = svg(`
  <rect x="30" y="46" width="40" height="40" fill="#e4ddc6" stroke="#4a4636" stroke-width="3"/>
  <path d="M26 48 L50 28 L74 48 Z" fill="#7d5a86" stroke="#3a2f42" stroke-width="3" stroke-linejoin="round"/>
  <rect x="47" y="12" width="6" height="18" fill="#caa02c"/>
  <rect x="42" y="17" width="16" height="6" fill="#caa02c"/>
  <path d="M43 86 L43 62 Q50 54 57 62 L57 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="52" r="5" fill="#8fbcd8" stroke="#4a4636" stroke-width="2"/>`);

const cathedral = svg(`
  <rect x="24" y="46" width="52" height="40" fill="#e4ddc6" stroke="#4a4636" stroke-width="3"/>
  <path d="M24 46 L34 22 L44 46 Z" fill="#6f4f78" stroke="#3a2f42" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M56 46 L66 22 L76 46 Z" fill="#6f4f78" stroke="#3a2f42" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="31" y="14" width="5" height="9" fill="#caa02c"/><rect x="63" y="14" width="5" height="9" fill="#caa02c"/>
  <path d="M42 86 L42 60 Q50 52 58 60 L58 86 Z" fill="#5a4632"/>
  <circle cx="50" cy="40" r="7" fill="#8fbcd8" stroke="#4a4636" stroke-width="2"/>`);

const treasury = svg(`
  <ellipse cx="50" cy="84" rx="30" ry="7" fill="#2f5a1a" opacity="0.4"/>
  <rect x="26" y="52" width="48" height="34" rx="4" fill="#7a5324" stroke="#3f2c12" stroke-width="3"/>
  <path d="M26 52 Q50 34 74 52 Z" fill="#8a5f2b" stroke="#3f2c12" stroke-width="3"/>
  <rect x="24" y="60" width="52" height="7" fill="#caa02c" stroke="#7a5c12" stroke-width="2"/>
  <rect x="46" y="60" width="8" height="14" fill="#e8c14a" stroke="#7a5c12" stroke-width="2"/>
  <g fill="#f4d768" stroke="#7a5c12" stroke-width="1.5">
    <circle cx="36" cy="46" r="6"/><circle cx="50" cy="42" r="6"/><circle cx="63" cy="46" r="6"/></g>`);

export const SPRITES = {
  grass, bush, tree, hut, house, mansion, castle, floatingCastle, tripleCastle,
  bear, tombstone, church, cathedral, treasury,
};
