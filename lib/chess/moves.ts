import {
  copyBoard,
  findKing,
  inBounds,
  oppositeColor,
  posEqual,
} from "./board";
import type { Board, Move, Piece, PieceColor, PieceType, Position } from "./types";

type Offset = readonly [number, number];

const KNIGHT_OFFSETS: readonly Offset[] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

const DIAGONALS: readonly Offset[] = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const ORTHOGONALS: readonly Offset[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** King steps and queen rays share the same eight directions. */
const KING_OFFSETS: readonly Offset[] = [...DIAGONALS, ...ORTHOGONALS];

const SLIDE_DIRECTIONS: Record<"b" | "r" | "q", readonly Offset[]> = {
  b: DIAGONALS,
  r: ORTHOGONALS,
  q: KING_OFFSETS,
};

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
  // Guard against off-board or non-integer squares (e.g. stale UI state)
  // instead of throwing "cannot read properties of undefined".
  if (!inBounds(from)) return [];
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
    for (const [dr, dc] of KNIGHT_OFFSETS) {
      addMove({ row: from.row + dr, col: from.col + dc });
    }
  } else if (type === "k") {
    for (const [dr, dc] of KING_OFFSETS) {
      addMove({ row: from.row + dr, col: from.col + dc });
    }
  } else {
    // Sliding pieces: walk each ray until blocked or off the board.
    for (const [dr, dc] of SLIDE_DIRECTIONS[type]) {
      for (let i = 1; i < 8; i++) {
        if (!addMove({ row: from.row + i * dr, col: from.col + i * dc })) break;
      }
    }
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
  promotion?: PieceType
): { board: Board; captured: Piece } {
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

/** True when moving `piece` to `to` lands a pawn on its last rank. */
export function isPromotionMove(piece: Piece, to: Position): boolean {
  if (piece?.type !== "p") return false;
  return (piece.color === "w" && to.row === 0) || (piece.color === "b" && to.row === 7);
}

/**
 * Reverse one recorded ply on a copied board: the mover (as it was
 * before any promotion) returns to `from` and the captured piece, if
 * any, reappears on `to`. Does not mutate `board`.
 */
export function undoMoveOnBoard(board: Board, move: Move): Board {
  const next = copyBoard(board);
  next[move.from.row][move.from.col] = move.piece ? { ...move.piece } : null;
  next[move.to.row][move.to.col] = move.captured ? { ...move.captured } : null;
  return next;
}

/**
 * Dead-position check for the simplest draws: K vs K, K+B vs K and
 * K+N vs K. Neither side can ever deliver mate, so the game should end
 * instead of shuffling kings forever.
 */
export function isInsufficientMaterial(board: Board): boolean {
  const extras: PieceType[] = [];
  for (const row of board) {
    for (const piece of row) {
      if (!piece || piece.type === "k") continue;
      extras.push(piece.type);
      if (extras.length > 1) return false;
    }
  }
  return extras.length === 0 || extras[0] === "b" || extras[0] === "n";
}
