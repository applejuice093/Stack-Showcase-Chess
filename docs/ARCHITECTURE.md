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
| `moves.ts` | Pseudo-legal + check-safe move gen (shared ray tables), `applyMove`, `undoMoveOnBoard`, `isPromotionMove`, `isInsufficientMaterial` |
| `undo.ts` | `undoTurn`: pop plies until the human's last move is undone |
| `ai.ts` | Black move scoring: capture bonus + `PIECE_VALUES[victim]`, promotion bonus (auto-queen), pawn push, noise |
| `pieces.ts` | Unicode glyphs, promotion choices |
| `sound.ts` | Optional Web Audio blips (SSR-safe) |

### `lib/stack`

`MoveStack` exposes `push`, `pop`, `peek`, `size`, `toArray`, `toTopFirst`. The page stores `Move[]` in React state and wraps it with `MoveStack.fromArray` when it needs ADT behaviour (undo, sidebar ordering, tests).

## Data flow (one ply)

1. UI selects a from-square → `getMoves(board, from)`.
2. User (or AI) chooses `to` → `applyMove` returns `{ board, captured }`.
3. Build a `Move` record → append to history (`push` semantics).
4. Flip turn; if the side to move has no legal moves → checkmate or stalemate via `isInCheck` + `hasLegalMoves`. Otherwise, `isInsufficientMaterial` ends bare-king / single-minor endings as a draw.

## Undo

Undo goes through `undoTurn(board, history, "w")`, which **pops** until it has removed a White move:

- For each popped ply, `undoMoveOnBoard` puts `move.piece` back on `from` (as a pawn if it promoted) and `move.captured` back on `to`.
- Normally that is two pops (AI reply + your move); one if the AI has not replied yet.
- The turn always returns to White; game-over / promotion overlays are cleared.

A single pop is not enough against the AI: it would hand the turn to Black and the AI would immediately play again.

There is no redo stack yet; a future enhancement can pair a second `MoveStack` for redo.

## What is intentionally incomplete

- Castling and en passant fields exist on `Move` but generators do not emit them.
- AI is a one-ply heuristic (no minimax / alpha-beta) and always promotes to a queen.
- Draws by threefold repetition and the 50-move rule are not detected.
- No FEN / PGN import-export.

These gaps are fine for a stack teaching demo; extend `lib/chess/moves.ts` first if you add rules.
