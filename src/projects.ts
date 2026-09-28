export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  techs?: string[];
  motif: string;
}

/** Presentation order — not a ranking. */
export const PROJECTS: Project[] = [
  {
    id: "chainmate",
    title: "ChainMate",
    category: "Web3 · Multiplayer · AI",
    description:
      "A multiplayer chess platform combining real-time gameplay, GenLayer-powered post-game analysis and Nimiq payment infrastructure.",
    techs: ["Next.js", "TypeScript", "Supabase", "GenLayer", "Nimiq"],
    motif: "board",
  },
  {
    id: "offkay",
    title: "Offkay",
    category: "Full-stack · Product",
    description:
      "Responsible for Offkay’s technical development, building and maintaining the platform’s core architecture.",
    motif: "plan",
  },
  {
    id: "while",
    title: "WHILE",
    category: "AI · Interactive Product",
    description:
      "An interactive AI waiting experience designed to make the time spent waiting for AI useful and engaging.",
    motif: "cycle",
  },
  {
    id: "nimiq",
    title: "Nimiq",
    category: "Web3 · Payments",
    description:
      "Work involving Nimiq wallet connectivity, payment flows, transaction handling and blockchain infrastructure.",
    motif: "ledger",
  },
  {
    id: "genlayer",
    title: "GenLayer",
    category: "AI · Web3",
    description:
      "Work involving AI-powered on-chain systems and decentralized application experiments.",
    motif: "layers",
  },
  {
    id: "experiments",
    title: "Experiments",
    category: "R&D · Prototypes",
    description:
      "Independent experiments across AI, Web3, interfaces, backend systems and emerging technologies.",
    motif: "sparks",
  },
];
