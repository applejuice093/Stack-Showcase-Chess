/**
 * Shared chess domain types for the board engine and move stack.
 * Kept free of React so unit tests can import them directly.
 */

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PieceColor = "w" | "b";

export type Piece = { type: PieceType; color: PieceColor } | null;

export type Board = Piece[][];

export type Position = { row: number; col: number };

/**
 * Immutable record of one completed ply. Stored on the move stack so
 * Undo can restore the prior board without replaying the whole game.
 *
 * Optional fields (promotion, castling, enPassant) are reserved for
 * rule extensions; the current UI implements promotion only.
 */
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece;
  promotion?: PieceType;
  castling?: { rookFrom: Position; rookTo: Position };
  enPassant?: Position;
}

export type LastMove = { from: Position; to: Position };
