# onchaindc — Developer

A cinematic single-page developer portfolio: a drag-rotatable 3D sphere of project
cards orbiting the central statement **"I build things that work."**, with a flat
archive grid, FLIP project lightbox and fullscreen menu.

## Stack

- [Vite](https://vite.dev) + vanilla TypeScript (no framework, no backend)
- Playfair Display + Inter via Google Fonts

## Run

```sh
npm install
npm run dev       # local dev server
npm run build     # static build → dist/
npm run typecheck # tsc --noEmit
```

## Deploying to Vercel

The site is fully static — no environment variables are required.

| Setting         | Value          |
| --------------- | -------------- |
| Framework Preset | **Vite**      |
| Build Command    | `npm run build` |
| Output Directory | `dist`         |

Import the Git repository in the Vercel dashboard; Vercel auto-detects Vite, so
the defaults above should apply without changes.

## Content

Six projects in presentation order (not a ranking): ChainMate, Offkay, WHILE,
Nimiq, GenLayer, Independent Experiments. No invented projects, credentials or
external links.
