import { describe, expect, it } from "vitest";
import type { Board, PieceType } from "@/lib/chess";
import { getMoves } from "@/lib/chess";

/** Empty board with both kings tucked in corners so check filtering works. */
function emptyBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );
  b[7][7] = { type: "k", color: "w" }; // h1, off d4's rays
  b[0][0] = { type: "k", color: "b" }; // a8, off d4's rays
  return b;
}

function movesFromD4(type: PieceType) {
  const b = emptyBoard();
  b[4][3] = { type, color: "w" }; // d4
  return getMoves(b, { row: 4, col: 3 });
}

describe("piece move counts from d4 on an open board", () => {
  it.each([
    ["b", 13],
    ["r", 14],
    ["q", 27],
    ["n", 8],
    ["k", 8],
  ] as const)("%s has %i moves", (type, count) => {
    expect(movesFromD4(type)).toHaveLength(count);
  });

  it("rays stop on (and include) the first enemy piece", () => {
    const b = emptyBoard();
    b[4][3] = { type: "r", color: "w" }; // d4
    b[2][3] = { type: "p", color: "b" }; // d6
    const up = getMoves(b, { row: 4, col: 3 }).filter((m) => m.col === 3 && m.row < 4);
    expect(up).toEqual([
      { row: 3, col: 3 },
      { row: 2, col: 3 },
    ]);
  });
});
