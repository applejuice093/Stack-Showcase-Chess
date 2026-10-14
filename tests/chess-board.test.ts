import { describe, expect, it } from "vitest";
import {
  initialBoard,
  copyBoard,
  findKing,
  toAlgebraic,
  getMoves,
  isInCheck,
  hasLegalMoves,
  applyMove,
  getAIMove,
} from "@/lib/chess";

describe("board helpers", () => {
  it("places both kings on the starting squares", () => {
    const board = initialBoard();
    expect(findKing(board, "w")).toEqual({ row: 7, col: 4 });
    expect(findKing(board, "b")).toEqual({ row: 0, col: 4 });
  });

  it("copyBoard deep-copies pieces", () => {
    const a = initialBoard();
    const b = copyBoard(a);
    b[6][0] = null;
    expect(a[6][0]).toEqual({ type: "p", color: "w" });
  });

  it("toAlgebraic maps row/col to chess labels", () => {
    expect(toAlgebraic({ row: 7, col: 0 })).toBe("a1");
    expect(toAlgebraic({ row: 0, col: 4 })).toBe("e8");
  });
});

describe("move generation", () => {
  it("gives white knights two starting leaps each", () => {
    const board = initialBoard();
    const moves = getMoves(board, { row: 7, col: 1 }); // b1 knight
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 5, col: 0 },
        { row: 5, col: 2 },
      ])
    );
    expect(moves).toHaveLength(2);
  });

  it("lets a central white pawn advance one or two squares", () => {
    const board = initialBoard();
    const moves = getMoves(board, { row: 6, col: 4 }); // e2
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 5, col: 4 },
        { row: 4, col: 4 },
      ])
    );
    expect(moves).toHaveLength(2);
  });

  it("reports no check and legal moves on the opening position", () => {
    const board = initialBoard();
    expect(isInCheck(board, "w")).toBe(false);
    expect(hasLegalMoves(board, "w")).toBe(true);
  });

  it("applyMove relocates the piece and reports captures", () => {
    const board = initialBoard();
    // Clear a path and put a black piece on e4 for a white pawn capture setup
    // instead: move white pawn e2→e4
    const { board: after, captured } = applyMove(
      board,
      { row: 6, col: 4 },
      { row: 4, col: 4 }
    );
    expect(captured).toBeNull();
    expect(after[4][4]).toEqual({ type: "p", color: "w" });
    expect(after[6][4]).toBeNull();
  });
});

describe("AI", () => {
  it("returns a legal black move from the opening board", () => {
    const board = initialBoard();
    // Advance a white pawn so it is black's turn conceptually; AI only
    // looks at black pieces regardless of turn flag.
    const move = getAIMove(board, () => 0);
    expect(move).not.toBeNull();
    if (!move) return;
    const legal = getMoves(board, move.from);
    expect(legal.some((m) => m.row === move.to.row && m.col === move.to.col)).toBe(
      true
    );
    expect(board[move.from.row][move.from.col]?.color).toBe("b");
  });

  it("prefers captures when random noise is zero", () => {
    const board = initialBoard();
    // Place an unprotected white pawn on a square a black knight can take
    // after moving black's knight path: put white pawn on c3, black knight b8 can go… 
    // Simpler: put white queen on a square adjacent to black king? 
    // Put white pawn on d5 and black pawn on e7 can capture? e7 is blocked.
    // Clear and set: black knight on b8, white pawn on a6 and c6 — knight from b8 goes to a6/c6.
    board[1][0] = null; // remove black a-pawn so square a6 empty for piece
    board[2][0] = { type: "p", color: "w" }; // a6 — knight on b8 attacks a6
    const move = getAIMove(board, () => 0);
    expect(move).not.toBeNull();
    // With zero random noise, any capture scores 100+ vs non-capture ≤5
    expect(board[move!.to.row][move!.to.col]?.color).toBe("w");
  });
});
