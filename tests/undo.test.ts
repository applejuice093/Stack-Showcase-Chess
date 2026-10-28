import { describe, expect, it } from "vitest";
import type { Board, Move, Position } from "@/lib/chess";
import { applyMove, initialBoard, undoTurn } from "@/lib/chess";

function play(board: Board, history: Move[], from: Position, to: Position) {
  const piece = board[from.row][from.col];
  const { board: next, captured } = applyMove(board, from, to);
  return { board: next, history: [...history, { from, to, piece, captured }] };
}

describe("undoTurn", () => {
  it("pops both the AI reply and the player's move", () => {
    const start = initialBoard();
    let s = play(start, [], { row: 6, col: 4 }, { row: 4, col: 4 }); // e2-e4
    s = play(s.board, s.history, { row: 1, col: 4 }, { row: 3, col: 4 }); // e7-e5
    const res = undoTurn(s.board, s.history);
    expect(res.popped).toBe(2);
    expect(res.moves).toEqual([]);
    expect(res.turn).toBe("w");
    expect(res.board).toEqual(start);
  });

  it("pops a single ply while the AI has not replied yet", () => {
    const start = initialBoard();
    const s = play(start, [], { row: 6, col: 4 }, { row: 4, col: 4 });
    const res = undoTurn(s.board, s.history);
    expect(res.popped).toBe(1);
    expect(res.board).toEqual(start);
  });

  it("keeps earlier moves on the stack", () => {
    let s = play(initialBoard(), [], { row: 6, col: 4 }, { row: 4, col: 4 });
    s = play(s.board, s.history, { row: 1, col: 4 }, { row: 3, col: 4 });
    const afterFirstPair = s.board;
    s = play(s.board, s.history, { row: 7, col: 6 }, { row: 5, col: 5 }); // Nf3
    s = play(s.board, s.history, { row: 0, col: 1 }, { row: 2, col: 2 }); // Nc6
    const res = undoTurn(s.board, s.history);
    expect(res.moves).toHaveLength(2);
    expect(res.board).toEqual(afterFirstPair);
  });

  it("is a no-op on an empty history", () => {
    const board = initialBoard();
    const res = undoTurn(board, []);
    expect(res.popped).toBe(0);
    expect(res.board).toEqual(board);
  });
});
