/**
 * Restrained, monochrome interface-fragment motifs — one per project.
 * Compositions read as UI fragments / technical artifacts rather than icons.
 * Stroke colour is inherited from `.art` / `.g-art` CSS.
 */
const SVG_OPEN = '<svg viewBox="0 0 160 100" fill="none" aria-hidden="true">';
const SVG_CLOSE = "</svg>";

const MOTIFS: Record<string, string> = {
  // ChainMate — chessboard interface with a live match panel
  board: `
    <rect x="22" y="14" width="72" height="72"/>
    <path d="M40 14v72M58 14v72M76 14v72M22 32h72M22 50h72M22 68h72"/>
    <rect x="40" y="32" width="18" height="18" fill="rgba(244,242,239,.16)" stroke="none"/>
    <rect x="76" y="68" width="18" height="18" fill="rgba(244,242,239,.16)" stroke="none"/>
    <path d="M104 14h34v40h-34z"/>
    <path d="M104 26h34M110 40h8M110 48h14"/>
    <circle cx="120" cy="62" r="3" opacity=".9"/>
    <path d="M104 74h34M104 82h22" opacity=".6"/>`,

  // Offkay — building floor plan + lease sidebar
  plan: `
    <rect x="22" y="16" width="72" height="68"/>
    <path d="M22 50h32M54 50v34M84 16v26M84 42h32"/>
    <path d="M54 40a10 10 0 0 1 10 10" opacity=".7"/>
    <path d="M104 16h34v68h-34z"/>
    <path d="M104 28h34M104 40h22M104 52h28M104 64h18" opacity=".8"/>
    <rect x="104" y="74" width="16" height="10" fill="rgba(244,242,239,.16)" stroke="none"/>`,

  // WHILE — large waiting dial with progress and elapsed ticks
  cycle: `
    <circle cx="62" cy="50" r="34"/>
    <path d="M62 50V28M62 50l15 11" opacity=".9"/>
    <path d="M62 10v7M62 90v-7M102 50h-7M22 50h7" opacity=".7"/>
    <path d="M44 28a22 22 0 0 1 24-6" opacity=".4"/>
    <path d="M116 22h30M116 34h22M116 46h30M116 58h18" opacity=".8"/>
    <rect x="116" y="68" width="30" height="12" opacity=".7"/>
    <path d="M121 74h20" opacity=".9"/>`,

  // Nimiq — payment terminal: tx rows, amount, confirm
  ledger: `
    <path d="M28 16v68"/>
    <rect x="38" y="20" width="58" height="12"/>
    <rect x="38" y="38" width="44" height="12" opacity=".75"/>
    <rect x="38" y="56" width="52" height="12" opacity=".5"/>
    <rect x="38" y="20" width="58" height="12" fill="rgba(244,242,239,.14)" stroke="none"/>
    <path d="M112 20h30M112 32h20" opacity=".8"/>
    <path d="M112 52h30v32h-30z"/>
    <path d="M120 68l6 6 12-12" opacity=".95"/>`,

  // GenLayer — stacked AI/on-chain layers with an inference node
  layers: `
    <path d="M56 12l38 18-38 18-38-18z"/>
    <path d="M18 50l38 18 38-18" opacity=".72"/>
    <path d="M18 70l38 18 38-18" opacity=".46"/>
    <circle cx="122" cy="30" r="9"/>
    <path d="M122 12v9M136 30h9M122 48v-9M108 30h5" opacity=".8"/>
    <path d="M112 60h30M112 72h22" opacity=".55"/>`,

  // Experiments — workbench: scattered probes, measurement, console
  sparks: `
    <path d="M30 24h10M35 19v10M62 16h8M66 12v8M92 30h9M96.5 25.5v9M46 44h9M50.5 39.5v9M78 52h9M82.5 47.5v9M112 24h9M116.5 19.5v9M52 74h9M56.5 69.5v9M126 62h9M130.5 57.5v9"/>
    <path d="M24 58h132" opacity=".35"/>
    <path d="M24 58v4M90 58v4M156 58v-4" opacity=".35"/>
    <circle cx="90" cy="58" r="4" opacity=".8"/>
    <path d="M60 86h64" opacity=".55"/>`,
};

export function motifSVG(key: string): string {
  const body = MOTIFS[key] ?? MOTIFS.sparks;
  return SVG_OPEN + body + SVG_CLOSE;
}
