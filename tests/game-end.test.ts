import { describe, expect, it } from "vitest";
import type { Board } from "@/lib/chess";
import {
  applyMove,
  hasLegalMoves,
  initialBoard,
  isInCheck,
  isInsufficientMaterial,
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
});
