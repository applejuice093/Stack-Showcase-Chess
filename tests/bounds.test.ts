import { describe, expect, it } from "vitest";
import { applyMove, getMoves, inBounds, initialBoard, pieceAt, undoMoveOnBoard } from "@/lib/chess";

describe("bounds handling", () => {
  it("rejects off-board and fractional squares", () => {
    expect(inBounds({ row: 0, col: 0 })).toBe(true);
    expect(inBounds({ row: 7, col: 7 })).toBe(true);
    expect(inBounds({ row: -1, col: 0 })).toBe(false);
    expect(inBounds({ row: 0, col: 8 })).toBe(false);
    expect(inBounds({ row: 1.5, col: 2 })).toBe(false);
  });

  it("getMoves returns [] for off-board origins instead of throwing", () => {
    const board = initialBoard();
    expect(getMoves(board, { row: 8, col: 0 })).toEqual([]);
    expect(getMoves(board, { row: -1, col: -1 })).toEqual([]);
  });

  it("pieceAt returns null off the board", () => {
    const board = initialBoard();
    expect(pieceAt(board, { row: 9, col: 9 })).toBeNull();
    expect(pieceAt(board, { row: 7, col: 4 })).toEqual({ type: "k", color: "w" });
  });

  it("applyMove and undoMoveOnBoard ignore off-board squares instead of throwing", () => {
    const board = initialBoard();
    const applied = applyMove(board, { row: -1, col: 0 }, { row: 0, col: 0 });
    expect(applied.captured).toBeNull();
    expect(applied.board[7][4]).toEqual({ type: "k", color: "w" });
    const undone = undoMoveOnBoard(board, {
      from: { row: 9, col: 9 },
      to: { row: 0, col: 0 },
      piece: { type: "p", color: "w" },
      captured: null,
    });
    expect(undone[7][4]).toEqual({ type: "k", color: "w" });
  });

});
