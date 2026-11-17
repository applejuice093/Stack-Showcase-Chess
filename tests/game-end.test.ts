import { describe, expect, it } from "vitest";
import type { Board } from "@/lib/chess";
import {
  applyMove,
  fromAlgebraic,
  getAllLegalMoves,
  getGameStatus,
  hasLegalMoves,
  initialBoard,
  isInCheck,
  isInsufficientMaterial,
  isLegalMove,
} from "@/lib/chess";

const empty = (): Board =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

describe("game end detection", () => {
  it("detects fool's mate as checkmate for White", () => {
    let b = initialBoard();
    b = applyMove(b, { row: 6, col: 5 }, { row: 5, col: 5 }).board; // f3
    b = applyMove(b, { row: 1, col: 4 }, { row: 3, col: 4 }).board; // e5
    b = applyMove(b, { row: 6, col: 6 }, { row: 4, col: 6 }).board; // g4
    b = applyMove(b, { row: 0, col: 3 }, { row: 4, col: 7 }).board; // Qh4#
    expect(isInCheck(b, "w")).toBe(true);
    expect(hasLegalMoves(b, "w")).toBe(false);
  });

  it("detects stalemate (no legal moves, not in check)", () => {
    const b = empty();
    b[0][0] = { type: "k", color: "b" }; // a8
    b[2][1] = { type: "q", color: "w" }; // b6
    b[7][7] = { type: "k", color: "w" }; // h1
    expect(isInCheck(b, "b")).toBe(false);
    expect(hasLegalMoves(b, "b")).toBe(false);
  });

  it("flags bare kings and a single minor piece as insufficient material", () => {
    const b = empty();
    b[0][0] = { type: "k", color: "b" };
    b[7][7] = { type: "k", color: "w" };
    expect(isInsufficientMaterial(b)).toBe(true);
    b[4][4] = { type: "n", color: "w" };
    expect(isInsufficientMaterial(b)).toBe(true);
    b[4][4] = { type: "b", color: "b" };
    expect(isInsufficientMaterial(b)).toBe(true);
  });

  it("does not flag positions that can still be won", () => {
    const b = empty();
    b[0][0] = { type: "k", color: "b" };
    b[7][7] = { type: "k", color: "w" };
    b[4][4] = { type: "p", color: "w" };
    expect(isInsufficientMaterial(b)).toBe(false);
    b[4][4] = { type: "r", color: "w" };
    expect(isInsufficientMaterial(b)).toBe(false);
    expect(isInsufficientMaterial(initialBoard())).toBe(false);
  });

  it("flags two bishops on the same colour as a draw, but not opposite colours", () => {
    const same = empty();
    same[0][0] = { type: "k", color: "b" };
    same[7][7] = { type: "k", color: "w" };
    same[0][2] = { type: "b", color: "w" }; // c8, dark
    same[2][0] = { type: "b", color: "b" }; // a6, dark
    expect(isInsufficientMaterial(same)).toBe(true);

    const opposite = empty();
    opposite[0][0] = { type: "k", color: "b" };
    opposite[7][7] = { type: "k", color: "w" };
    opposite[0][2] = { type: "b", color: "w" }; // c8, dark
    opposite[0][1] = { type: "b", color: "b" }; // b8, light
    expect(isInsufficientMaterial(opposite)).toBe(false);
  });
});

describe("legal move helpers and game status", () => {
  it("lists 20 legal opening moves for White and accepts e2e4", () => {
    const board = initialBoard();
    const moves = getAllLegalMoves(board, "w");
    expect(moves).toHaveLength(20);
    const e2 = fromAlgebraic("e2")!;
    const e4 = fromAlgebraic("e4")!;
    const e5 = fromAlgebraic("e5")!;
    expect(isLegalMove(board, e2, e4)).toBe(true);
    expect(isLegalMove(board, e2, e5)).toBe(false);
  });

  it("returns playing / checkmate / stalemate / draw statuses", () => {
    expect(getGameStatus(initialBoard(), "w")).toEqual({
      state: "playing",
      check: false,
    });

    let fool = initialBoard();
    fool = applyMove(fool, { row: 6, col: 5 }, { row: 5, col: 5 }).board; // f3
    fool = applyMove(fool, { row: 1, col: 4 }, { row: 3, col: 4 }).board; // e5
    fool = applyMove(fool, { row: 6, col: 6 }, { row: 4, col: 6 }).board; // g4
    fool = applyMove(fool, { row: 0, col: 3 }, { row: 4, col: 7 }).board; // Qh4#
    expect(getGameStatus(fool, "w")).toEqual({
      state: "checkmate",
      winner: "b",
    });

    const stale = empty();
    stale[0][0] = { type: "k", color: "b" };
    stale[2][1] = { type: "q", color: "w" };
    stale[7][7] = { type: "k", color: "w" };
    expect(getGameStatus(stale, "b")).toEqual({ state: "stalemate" });

    const bare = empty();
    bare[0][0] = { type: "k", color: "b" };
    bare[7][7] = { type: "k", color: "w" };
    expect(getGameStatus(bare, "w")).toEqual({ state: "draw-insufficient" });
  });
});
