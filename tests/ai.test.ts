import { describe, expect, it } from "vitest";
import type { Board } from "@/lib/chess";
import { getAIMove, isInCheck, applyMove } from "@/lib/chess";

const empty = (): Board =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

describe("AI check preference", () => {
  it("prefers a checking move when captures are not available", () => {
    const board = empty();
    board[0][0] = { type: "k", color: "b" }; // a8
    board[7][4] = { type: "k", color: "w" }; // e1
    board[6][0] = { type: "r", color: "b" }; // a2: can slide to e2 and check

    const move = getAIMove(board, () => 0);
    expect(move).not.toBeNull();
    const next = applyMove(board, move!.from, move!.to, move!.promotion).board;
    expect(isInCheck(next, "w")).toBe(true);
  });
});
