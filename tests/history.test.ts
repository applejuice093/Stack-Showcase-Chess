import { describe, expect, it } from "vitest";
import type { Board, Move } from "@/lib/chess";
import { applyMove, initialBoard, isPromotionMove, undoMoveOnBoard } from "@/lib/chess";

describe("isPromotionMove", () => {
  it("is true only for pawns reaching their final rank", () => {
    expect(isPromotionMove({ type: "p", color: "w" }, { row: 0, col: 3 })).toBe(true);
    expect(isPromotionMove({ type: "p", color: "b" }, { row: 7, col: 3 })).toBe(true);
    expect(isPromotionMove({ type: "p", color: "w" }, { row: 7, col: 3 })).toBe(false);
    expect(isPromotionMove({ type: "q", color: "w" }, { row: 0, col: 3 })).toBe(false);
    expect(isPromotionMove(null, { row: 0, col: 3 })).toBe(false);
  });
});

describe("undoMoveOnBoard", () => {
  it("restores a capture", () => {
    const board: Board = initialBoard();
    board[5][3] = { type: "p", color: "b" }; // black pawn on d3
    const from = { row: 6, col: 4 }; // e2 pawn takes d3
    const to = { row: 5, col: 3 };
    const { board: after, captured } = applyMove(board, from, to);
    const move: Move = { from, to, piece: { type: "p", color: "w" }, captured };
    expect(undoMoveOnBoard(after, move)).toEqual(board);
  });

  it("turns a promoted queen back into a pawn", () => {
    const board: Board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    board[1][0] = { type: "p", color: "w" };
    const from = { row: 1, col: 0 };
    const to = { row: 0, col: 0 };
    const { board: after } = applyMove(board, from, to, "q");
    expect(after[0][0]).toEqual({ type: "q", color: "w" });
    const move: Move = { from, to, piece: { type: "p", color: "w" }, captured: null, promotion: "q" };
    const undone = undoMoveOnBoard(after, move);
    expect(undone[1][0]).toEqual({ type: "p", color: "w" });
    expect(undone[0][0]).toBeNull();
  });

  it("does not mutate the input board", () => {
    const board = initialBoard();
    const snapshot = JSON.stringify(board);
    undoMoveOnBoard(board, {
      from: { row: 6, col: 0 },
      to: { row: 4, col: 0 },
      piece: { type: "p", color: "w" },
      captured: null,
    });
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});
