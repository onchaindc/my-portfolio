/**
 * Restrained, monochrome line motifs — one per project.
 * Same visual language across all six so the sphere reads as one collection.
 * Stroke colour is inherited from `.art` / `.g-art` CSS.
 */
const SVG_OPEN = '<svg viewBox="0 0 160 100" fill="none" aria-hidden="true">';
const SVG_CLOSE = "</svg>";

const MOTIFS: Record<string, string> = {
  // ChainMate — a fragment of a chessboard
  board: `
    <rect x="44" y="14" width="72" height="72"/>
    <path d="M62 14v72M80 14v72M98 14v72M44 32h72M44 50h72M44 68h72"/>
    <rect x="62" y="32" width="18" height="18" fill="rgba(244,242,239,.10)" stroke="none"/>
    <rect x="98" y="68" width="18" height="18" fill="rgba(244,242,239,.10)" stroke="none"/>`,

  // Offkay — a floor plan
  plan: `
    <rect x="36" y="16" width="88" height="68"/>
    <path d="M36 48h34M70 48v36M100 16v26M100 42h24"/>
    <path d="M70 40a8 8 0 0 1 8 8" opacity=".7"/>`,

  // WHILE — a dial, time passing while waiting
  cycle: `
    <circle cx="80" cy="50" r="30"/>
    <path d="M80 50V32M80 50l13 9"/>
    <path d="M80 14v6M116 50h-6M80 86v-6M44 50h6" opacity=".7"/>`,

  // Nimiq — ledger rows
  ledger: `
    <path d="M40 24v52"/>
    <rect x="52" y="28" width="64" height="11"/>
    <rect x="52" y="45" width="48" height="11"/>
    <rect x="52" y="62" width="56" height="11"/>
    <rect x="52" y="28" width="64" height="11" fill="rgba(244,242,239,.08)" stroke="none"/>`,

  // GenLayer — stacked layers
  layers: `
    <path d="M80 12l38 18-38 18-38-18z"/>
    <path d="M42 50l38 18 38-18" opacity=".72"/>
    <path d="M42 70l38 18 38-18" opacity=".46"/>`,

  // Independent experiments — scattered marks
  sparks: `
    <path d="M50 26h10M55 21v10M92 20h8M96 16v8M124 44h10M129 39v10M62 58h10M67 53v10M100 68h8M104 64v8M44 76h8M48 72v8M76 40h10M81 35v10M132 74h8M136 70v8"/>
    <circle cx="80" cy="50" r="26" opacity=".35"/>`,
};

export function motifSVG(key: string): string {
  const body = MOTIFS[key] ?? MOTIFS.sparks;
  return SVG_OPEN + body + SVG_CLOSE;
}
