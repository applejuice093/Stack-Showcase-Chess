import {
  copyBoard,
  findKing,
  inBounds,
  oppositeColor,
  posEqual,
} from "./board";
import type { Board, PieceColor, Position } from "./types";

/**
 * Pseudo-legal then (optionally) check-filtered moves from `from`.
 *
 * When `checkSafety` is false we skip the "does this leave our king in
 * check?" filter — that path is used by attack detection to avoid
 * infinite recursion between isSquareAttacked and getMoves.
 */
export function getMoves(
  board: Board,
  from: Position,
  checkSafety = true
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { type, color } = piece;

  /** Returns true if the square was empty (ray can continue). */
  const addMove = (to: Position): boolean => {
    if (!inBounds(to)) return false;
    const target = board[to.row][to.col];
    if (target?.color === color) return false;
    moves.push(to);
    return !target;
  };

  if (type === "p") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;

    const fwd = { row: from.row + dir, col: from.col };
    if (inBounds(fwd) && !board[fwd.row][fwd.col]) {
      moves.push(fwd);
      if (from.row === startRow) {
        const fwd2 = { row: from.row + 2 * dir, col: from.col };
        if (!board[fwd2.row][fwd2.col]) moves.push(fwd2);
      }
    }

    for (const dc of [-1, 1]) {
      const to = { row: from.row + dir, col: from.col + dc };
      if (
        inBounds(to) &&
        board[to.row][to.col] &&
        board[to.row][to.col]?.color !== color
      ) {
        moves.push(to);
      }
    }
  } else if (type === "n") {
    const offs = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    offs.forEach(([dr, dc]) =>
      addMove({ row: from.row + dr, col: from.col + dc })
    );
  } else if (type === "b") {
    [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ].forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) {
        if (!addMove({ row: from.row + i * dr, col: from.col + i * dc })) break;
      }
    });
  } else if (type === "r") {
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) {
        if (!addMove({ row: from.row + i * dr, col: from.col + i * dc })) break;
      }
    });
  } else if (type === "q") {
    [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ].forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) {
        if (!addMove({ row: from.row + i * dr, col: from.col + i * dc })) break;
      }
    });
  } else if (type === "k") {
    [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ].forEach(([dr, dc]) => {
      addMove({ row: from.row + dr, col: from.col + dc });
    });
  }

  if (!checkSafety) return moves;

  return moves.filter((to) => {
    const test = copyBoard(board);
    test[to.row][to.col] = test[from.row][from.col];
    test[from.row][from.col] = null;
    return !isInCheck(test, color);
  });
}

export function isSquareAttacked(
  board: Board,
  pos: Position,
  byColor: PieceColor
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== byColor) continue;

      const attacks = getMoves(board, { row: r, col: c }, false);
      if (attacks.some((m) => posEqual(m, pos))) return true;
    }
  }
  return false;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareAttacked(board, kingPos, oppositeColor(color));
}

export function hasLegalMoves(board: Board, color: PieceColor): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (
        board[r][c]?.color === color &&
        getMoves(board, { row: r, col: c }).length > 0
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Apply a from→to ply onto a copied board. Does not mutate `board`.
 * Promotion replaces the moving piece type when provided.
 */
export function applyMove(
  board: Board,
  from: Position,
  to: Position,
  promotion?: import("./types").PieceType
): { board: Board; captured: import("./types").Piece } {
  const next = copyBoard(board);
  const piece = next[from.row][from.col];
  const captured = next[to.row][to.col];
  if (!piece) {
    return { board: next, captured: null };
  }

  if (promotion) {
    next[to.row][to.col] = { type: promotion, color: piece.color };
  } else {
    next[to.row][to.col] = piece;
  }
  next[from.row][from.col] = null;
  return { board: next, captured };
}
