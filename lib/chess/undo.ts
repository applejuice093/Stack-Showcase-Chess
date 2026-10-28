import { MoveStack } from "../stack/MoveStack";
import { undoMoveOnBoard } from "./moves";
import type { Board, Move, PieceColor } from "./types";

export type UndoResult = {
  board: Board;
  moves: Move[];
  /** Side to move after undoing — always the human player. */
  turn: PieceColor;
  /** Number of plies popped (0 when history was empty). */
  popped: number;
};

/**
 * Undo back to the human player's last decision.
 *
 * Against the AI a single pop is not enough: if White just got a reply,
 * popping only Black's move hands the turn to Black and the AI simply
 * plays again. So we keep popping until we have removed a move made by
 * `human` (normally two plies, one if the AI hasn't replied yet).
 */
export function undoTurn(
  board: Board,
  history: readonly Move[],
  human: PieceColor = "w"
): UndoResult {
  const stack = MoveStack.fromArray(history);
  let next = board;
  let popped = 0;

  while (!stack.isEmpty()) {
    const move = stack.pop()!;
    next = undoMoveOnBoard(next, move);
    popped++;
    if (move.piece?.color === human) break;
  }

  return { board: next, moves: stack.toArray(), turn: human, popped };
}
