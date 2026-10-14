import type { Piece, PieceType } from "./types";

const SYMBOLS: Record<PieceType, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

export function getPieceSymbol(piece: Piece): string {
  if (!piece) return "";
  return SYMBOLS[piece.type];
}

export const PROMOTION_CHOICES: PieceType[] = ["q", "r", "b", "n"];
