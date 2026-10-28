# Stack-Showcase-Chess

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A Next.js chess demo that teaches **stack (LIFO) data structures** through playable move history. Every legal ply is **pushed** onto a move stack; **Undo** **pops** the top ply and restores the prior board. A shallow heuristic AI plays Black so you can watch pushes accumulate in the sidebar.

> This is a teaching showcase, not a full FIDE rules engine. Castling and en passant are not implemented yet (types leave room for them). Pawn promotion (including AI auto-queening), check, checkmate, stalemate and draws by insufficient material (K vs K, K+B/N vs K) are supported.

---

## Why stacks?

Chess timelines are naturally LIFO when players undo:

| Operation | Chess action | Stack call |
| :--- | :--- | :--- |
| Play a move | Apply ply, flip turn | `push(move)` |
| Undo | Restore captured piece / from-square | `pop()` |
| Inspect latest | Highlight TOP in the sidebar | `peek()` |

The React UI keeps `Move[]` in state for re-renders; `lib/stack/MoveStack` wraps that array with an explicit ADT used by tests and the sidebar’s top-first view. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full map.

---

## Features

- Playable board (you = White) with legal-move highlights
- Black AI that prefers captures (highest-value piece first) and promotes its pawns, with a short “thinking” delay
- Live **Move Stack** panel (TOP marker, algebraic squares, captures)
- Undo (pop) back to your last move — the AI's reply and your move are both popped — and Reset
- Pawn promotion picker
- Check / checkmate / stalemate / insufficient-material draw detection
- Pure TypeScript engine under `lib/` with unit tests (`npm test`)

---

## Tech stack

| Tool | Role |
| :--- | :--- |
| **Next.js 16** (App Router) | UI shell and routing |
| **React 19 + TypeScript** | Board UI and typed engine |
| **Tailwind CSS 4** | Layout and theming |
| **Framer Motion** | Light square / stack animations |
| **Vitest** | Unit tests for stack + chess logic |

**Node:** `>=18.18.0` (see `package.json` `engines`)

No environment variables are required for local play.

---

## Getting started

```bash
git clone https://github.com/applejuice093/Stack-Showcase-Chess.git
cd Stack-Showcase-Chess
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (stack + chess unit tests) |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |
| `npm run check` | Typecheck + lint + tests in one go (run before pushing) |
| `npm run test:watch` | Vitest watch mode |

---

## Project structure

```
├── app/                 # Next.js App Router (layout + ChessGame page)
├── lib/
│   ├── chess/           # Types, board, moves, AI, pieces, sound
│   └── stack/           # MoveStack LIFO ADT
├── tests/               # Vitest unit tests
├── docs/                # Architecture notes
├── public/              # Static assets
├── vitest.config.ts
└── package.json
```

---

## How the stack ties to chess moves

1. White clicks a piece → legal targets from `getMoves`.
2. On a legal click (or AI reply), `applyMove` updates the board and a `Move` record is **pushed** onto the history stack.
3. The sidebar reads `MoveStack.toTopFirst()` so the newest ply is visually TOP.
4. **Undo (Pop)** calls `undoTurn`, which pops plies until it has removed one of *your* moves (usually two: the AI reply and your move) and writes each saved piece / capture back onto the board. Popping only the AI reply would just hand the turn back to the AI.

---

## Author

applejuice093 — [GitHub](https://github.com/applejuice093)

Made by Ansh, Shubham, Aniket
