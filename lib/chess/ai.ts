import { getMoves } from "./moves";
import type { Board, PieceType, Position } from "./types";

export type ScoredMove = {
  from: Position;
  to: Position;
  score: number;
};

/**
 * Heuristic weights for the black AI. Captures dominate so the bot
 * feels aggressive; a small pawn-advance bonus nudges development;
 * randomNoise keeps games from repeating the same line.
 */
export const AI_WEIGHTS = {
  /** Base bonus for any capture; the victim's value is added on top. */
  capture: 100,
  pawnAdvance: 5,
  randomNoise: 10,
} as const;

/**
 * Classic material values (in pawns × 10) used to rank captures, so the
 * AI takes a queen over a pawn when both are available. The king is 0
 * because legal move generation never lets it be captured.
 */
export const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 0,
};

/**
 * Collect every legal black move, score them, and return the best.
 * Returns null when black has no legal moves (checkmate / stalemate).
 *
 * This is intentionally shallow (no minimax) — the project is a stack
 * showcase, not a tournament engine.
 */
export function getAIMove(
  board: Board,
  random: () => number = Math.random
): { from: Position; to: Position } | null {
  const scored = collectScoredMoves(board, random);
  if (scored.length === 0) return null;

  const best = scored.reduce((acc, curr) =>
    curr.score > acc.score ? curr : acc
  );
  return { from: best.from, to: best.to };
}

export function collectScoredMoves(
  board: Board,
  random: () => number = Math.random
): ScoredMove[] {
  const scored: ScoredMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color !== "b") continue;
      const from = { row: r, col: c };
      for (const to of getMoves(board, from)) {
        scored.push({
          from,
          to,
          score: scoreMove(board, from, to, random),
        });
      }
    }
  }

  return scored;
}

function scoreMove(
  board: Board,
  from: Position,
  to: Position,
  random: () => number
): number {
  let score = random() * AI_WEIGHTS.randomNoise;
  const target = board[to.row][to.col];
  if (target) score += AI_WEIGHTS.capture + PIECE_VALUES[target.type];
  if (board[from.row][from.col]?.type === "p") {
    score += AI_WEIGHTS.pawnAdvance;
  }
  return score;
}
