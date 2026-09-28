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
      "A multiplayer chess platform combining real-time gameplay, competitive infrastructure, GenLayer-powered post-game analysis and Nimiq payments.",
    techs: ["Next.js", "TypeScript", "Supabase", "GenLayer", "Nimiq"],
    motif: "board",
  },
  {
    id: "offkay",
    title: "Offkay",
    category: "Full-stack · Product",
    description:
      "Student-housing platform. Responsible for Offkay's technical development, building and maintaining the platform's core architecture.",
    motif: "plan",
  },
  {
    id: "while",
    title: "WHILE",
    category: "AI · Interactive Product",
    description:
      "An interactive AI waiting experience designed to make the time while an AI response is being generated useful and engaging through lightweight interactive experiences.",
    motif: "cycle",
  },
  {
    id: "nimiq",
    title: "Nimiq",
    category: "Web3 · Payments",
    description:
      "Nimiq wallet connectivity, payment flows, transaction handling, verification and blockchain infrastructure.",
    motif: "ledger",
  },
  {
    id: "genlayer",
    title: "GenLayer",
    category: "AI · Web3",
    description:
      "AI-powered on-chain systems, including decentralized and AI-assisted application experiments and escrow infrastructure.",
    motif: "layers",
  },
  {
    id: "experiments",
    title: "Independent Experiments",
    category: "R&D · Prototypes",
    description:
      "A collection of smaller experiments across AI, Web3, product interfaces, backend systems and emerging technologies.",
    motif: "sparks",
  },
];
