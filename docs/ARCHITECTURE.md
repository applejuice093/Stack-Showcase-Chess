# Architecture

## Goals

1. Demonstrate a **stack** managing chess move history (push on play, pop on undo).
2. Keep pure game logic out of React so it can be unit-tested.
3. Provide a simple AI opponent without claiming deep engine strength.

## Layers

```
app/page.tsx          React UI: board clicks, stack sidebar, overlays
        │
        ▼
lib/chess/*           Pure board / moves / AI / notation / sound
lib/stack/MoveStack   LIFO ADT over Move records
```

### `lib/chess`

| Module | Responsibility |
| :--- | :--- |
| `types.ts` | `Piece`, `Board`, `Position`, `Move` |
| `board.ts` | Initial position, copy, bounds, king find, algebraic |
| `moves.ts` | Pseudo-legal + check-safe move gen, applyMove |
| `ai.ts` | Black move scoring (captures > pawn push > noise) |
| `pieces.ts` | Unicode glyphs, promotion choices |
| `sound.ts` | Optional Web Audio blips (SSR-safe) |

### `lib/stack`

`MoveStack` exposes `push`, `pop`, `peek`, `size`, `toArray`, `toTopFirst`. The page stores `Move[]` in React state and wraps it with `MoveStack.fromArray` when it needs ADT behaviour (undo, sidebar ordering, tests).

## Data flow (one ply)

1. UI selects a from-square → `getMoves(board, from)`.
2. User (or AI) chooses `to` → `applyMove` returns `{ board, captured }`.
3. Build a `Move` record → append to history (`push` semantics).
4. Flip turn; if the side to move has no legal moves → checkmate or stalemate via `isInCheck` + `hasLegalMoves`.

## Undo

Undo is a single stack **pop**:

- Restore `move.piece` on `from`.
- Restore `move.captured` on `to` (or empty).
- Flip turn back; clear game-over / promotion overlays.

There is no redo stack yet; a future enhancement can pair a second `MoveStack` for redo.

## What is intentionally incomplete

- Castling and en passant fields exist on `Move` but generators do not emit them.
- AI is a one-ply heuristic (no minimax / alpha-beta).
- No FEN / PGN import-export.

These gaps are fine for a stack teaching demo; extend `lib/chess/moves.ts` first if you add rules.
