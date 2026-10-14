import type { Board, Piece, PieceColor, PieceType, Position } from "./types";

/** Standard opening position (black on rows 0–1, white on rows 6–7). */
export function initialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  for (let i = 0; i < 8; i++) {
    b[1][i] = { type: "p", color: "b" };
    b[6][i] = { type: "p", color: "w" };
  }

  const backRank: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let i = 0; i < 8; i++) {
    b[0][i] = { type: backRank[i], color: "b" };
    b[7][i] = { type: backRank[i], color: "w" };
  }

  return b;
}

/** Deep-copy pieces so mutations never alias React state. */
export function copyBoard(board: Board): Board {
  return board.map((row) => row.map((p) => (p ? { ...p } : null)));
}

export function posEqual(
  a: Position | null | undefined,
  b: Position | null | undefined
): boolean {
  return (
    a != null && b != null && a.row === b.row && a.col === b.col
  );
}

export function inBounds(p: Position): boolean {
  return p.row >= 0 && p.row < 8 && p.col >= 0 && p.col < 8;
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece?.type === "k" && piece.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function oppositeColor(color: PieceColor): PieceColor {
  return color === "w" ? "b" : "w";
}

/** Algebraic square label, e.g. {row:6,col:4} → "e2". */
export function toAlgebraic(pos: Position): string {
  return `${String.fromCharCode(97 + pos.col)}${8 - pos.row}`;
}

export function pieceAt(board: Board, pos: Position): Piece {
  return board[pos.row][pos.col];
}
