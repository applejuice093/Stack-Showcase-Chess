"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  type Board,
  type PieceColor,
  type PieceType,
  type Position,
  type Move,
  initialBoard,
  posEqual,
  isInCheck,
  getMoves,
  hasLegalMoves,
  applyMove,
  getAIMove,
  getPieceSymbol,
  PROMOTION_CHOICES,
  playSound,
  SOUND,
  toAlgebraic,
  isPromotionMove,
  isInsufficientMaterial,
  undoTurn,
} from "@/lib/chess";
import { MoveStack } from "@/lib/stack";

export default function ChessGame() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<PieceColor>("w");
  const [selected, setSelected] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [moveStack, setMoveStack] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(
    null
  );
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState<Position | null>(null);
  const [stackAnim, setStackAnim] = useState<"push" | "pop" | null>(null);

  const pulseStack = (kind: "push" | "pop") => {
    setStackAnim(kind);
    window.setTimeout(() => setStackAnim(null), 300);
  };

  const finishTurn = (
    nextBoard: Board,
    nextTurn: PieceColor,
    mover: PieceColor
  ) => {
    if (!hasLegalMoves(nextBoard, nextTurn)) {
      if (isInCheck(nextBoard, nextTurn)) {
        setGameOver(
          `Checkmate! ${mover === "w" ? "White" : "Black"} wins!`
        );
        playSound(SOUND.mate);
      } else {
        setGameOver("Stalemate! Draw!");
      }
    } else if (isInsufficientMaterial(nextBoard)) {
      setGameOver("Draw by insufficient material!");
    } else if (isInCheck(nextBoard, nextTurn)) {
      playSound(SOUND.check);
    }
  };

  const makeMove = useCallback(
    (from: Position, to: Position, promo?: PieceType) => {
      const piece = board[from.row][from.col];
      if (!piece) return;

      const { board: newBoard, captured } = applyMove(board, from, to, promo);
      const move: Move = {
        from,
        to,
        piece: { ...piece },
        captured,
        ...(promo ? { promotion: promo } : {}),
      };

      const nextTurn: PieceColor = turn === "w" ? "b" : "w";
      setBoard(newBoard);
      setTurn(nextTurn);
      setSelected(null);
      setLegalMoves([]);
      setMoveStack([...moveStack, move]);
      setLastMove({ from, to });
      setShowPromo(null);
      pulseStack("push");
      playSound(captured ? SOUND.capture : SOUND.move);
      finishTurn(newBoard, nextTurn, turn);
    },
    [board, turn, moveStack]
  );

  // Undo rolls back to White's last decision. Popping only the AI's reply
  // would hand the turn to Black and the AI would immediately move again.
  const undoMove = () => {
    const result = undoTurn(board, moveStack, "w");
    if (result.popped === 0) return;

    const remaining = result.moves;
    const top = remaining[remaining.length - 1];
    setBoard(result.board);
    setTurn(result.turn);
    setMoveStack(remaining);
    setLastMove(top ? { from: top.from, to: top.to } : null);
    setGameOver(null);
    setShowPromo(null);
    setSelected(null);
    setLegalMoves([]);
    pulseStack("pop");
    playSound(SOUND.move);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;
    if (turn === "b") return; // Black is AI-controlled

    const pos = { row, col };
    const piece = board[row][col];

    if (selected) {
      const isLegal = legalMoves.some((m) => posEqual(m, pos));

      if (isLegal) {
        const p = board[selected.row][selected.col];
        if (isPromotionMove(p, pos)) {
          setShowPromo(pos);
          return;
        }
        makeMove(selected, pos);
      } else if (piece?.color === turn) {
        setSelected(pos);
        setLegalMoves(getMoves(board, pos));
      } else {
        setSelected(null);
        setLegalMoves([]);
      }
    } else if (piece?.color === turn) {
      setSelected(pos);
      setLegalMoves(getMoves(board, pos));
    }
  };

  const reset = () => {
    setBoard(initialBoard());
    setTurn("w");
    setSelected(null);
    setLegalMoves([]);
    setMoveStack([]);
    setLastMove(null);
    setGameOver(null);
    setShowPromo(null);
    setStackAnim(null);
  };

  // AI responds after White's turn
  useEffect(() => {
    if (turn !== "b" || gameOver) return;

    const timer = window.setTimeout(() => {
      const aiMove = getAIMove(board);
      if (!aiMove) return;

      const piece = board[aiMove.from.row][aiMove.from.col];
      if (!piece) return;

      const { board: newBoard, captured } = applyMove(
        board,
        aiMove.from,
        aiMove.to,
        aiMove.promotion
      );
      const move: Move = {
        from: aiMove.from,
        to: aiMove.to,
        piece: { ...piece },
        captured,
        ...(aiMove.promotion ? { promotion: aiMove.promotion } : {}),
      };

      setBoard(newBoard);
      setTurn("w");
      setSelected(null);
      setLegalMoves([]);
      setMoveStack([...moveStack, move]);
      setLastMove({ from: aiMove.from, to: aiMove.to });
      pulseStack("push");
      playSound(captured ? SOUND.capture : SOUND.move);
      finishTurn(newBoard, "w", "b");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [turn, gameOver, board, moveStack]);

  const stackView = MoveStack.fromArray(moveStack).toTopFirst();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-pink-400"
          >
            Stack-Based Chess
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative bg-slate-800/50 p-4 rounded-2xl backdrop-blur-xl border-none outline-none shadow-none">
              <div className="grid grid-cols-8 gap-0 max-w-2xl mx-auto border-none outline-none shadow-none">
                {board.map((row, r) =>
                  row.map((piece, c) => {
                    const isLight = (r + c) % 2 === 0;
                    const pos = { row: r, col: c };
                    const isSelected = posEqual(selected, pos);
                    const isLegal = legalMoves.some((m) => posEqual(m, pos));
                    const isLast =
                      lastMove &&
                      (posEqual(lastMove.from, pos) ||
                        posEqual(lastMove.to, pos));

                    return (
                      <motion.button
                        key={`${r}-${c}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSquareClick(r, c)}
                        aria-label={`Square ${toAlgebraic(pos)}`}
                        className={`
                        aspect-square flex items-center justify-center text-4xl lg:text-5xl border-none outline-none
                        ${isLight ? "bg-slate-700/40" : "bg-slate-800/60"}
                        ${isSelected ? "ring-4 ring-cyan-400 ring-inset" : ""}
                        ${isLast ? "bg-yellow-500/30" : ""}
                        ${isLegal && selected ? "ring-2 ring-blue-400 ring-inset" : ""}
                        hover:brightness-125 transition-all
                      `}
                      >
                        {piece && (
                          <span
                            className={
                              piece.color === "w"
                                ? "text-white"
                                : "text-yellow-200"
                            }
                          >
                            {getPieceSymbol(piece)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                  <div className="bg-linear-to-br from-purple-900 to-pink-900 p-8 rounded-xl text-center border-2 border-cyan-400">
                    <h2 className="text-3xl font-bold mb-4">{gameOver}</h2>
                    <button
                      onClick={reset}
                      className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-lg font-bold"
                    >
                      New Game
                    </button>
                  </div>
                </div>
              )}

              {showPromo && selected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
                  <div className="bg-slate-800 p-8 rounded-xl border-2 border-cyan-400">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      Promote Pawn
                    </h3>
                    <div className="flex gap-4">
                      {PROMOTION_CHOICES.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            makeMove(selected, showPromo, t);
                          }}
                          className="w-20 h-20 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-5xl"
                        >
                          {getPieceSymbol({ type: t, color: turn })}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={undoMove}
                disabled={moveStack.length === 0}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-bold"
              >
                Undo (Pop)
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold"
              >
                Reset
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="inline-block px-8 py-4 bg-cyan-500/20 rounded-xl border border-cyan-400/30">
                <p className="text-sm text-gray-400">Current Turn</p>
                <p className="text-3xl font-bold">
                  {turn === "w" ? "White (You)" : "Black (AI)"}
                </p>
                {isInCheck(board, turn) && !gameOver && (
                  <p className="text-red-400 font-bold mt-2">CHECK!</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div
              className={`bg-slate-800/50 p-6 rounded-2xl backdrop-blur-xl border border-purple-500/20 h-full transition-shadow ${
                stackAnim === "push"
                  ? "shadow-[0_0_24px_rgba(34,211,238,0.45)]"
                  : stackAnim === "pop"
                    ? "shadow-[0_0_24px_rgba(244,114,182,0.45)]"
                    : ""
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">Move Stack</h2>
                <div className="px-4 py-2 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                  <span className="text-cyan-400 font-mono font-bold">
                    {moveStack.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {stackView.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-gray-500 mb-2">(empty)</p>
                    <p>Stack is empty — make a move to push</p>
                  </div>
                ) : (
                  stackView.map((move, idx) => {
                    const actualIdx = moveStack.length - 1 - idx;
                    const isTop = idx === 0;

                    return (
                      <motion.div
                        key={`${actualIdx}-${toAlgebraic(move.from)}-${toAlgebraic(move.to)}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          p-4 rounded-lg border
                          ${
                            isTop
                              ? "bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400/50"
                              : "bg-slate-700/30 border-slate-600/30"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-mono text-gray-400">
                            #{actualIdx + 1}
                          </span>
                          {isTop && (
                            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded">
                              TOP
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {getPieceSymbol(move.piece)}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-mono font-bold text-purple-300">
                                {toAlgebraic(move.from)}
                              </span>
                              <span className="text-gray-500">→</span>
                              <span className="font-mono font-bold text-cyan-300">
                                {toAlgebraic(move.to)}
                              </span>
                            </div>
                            {move.captured && (
                              <div className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                <span>Captured:</span>
                                <span className="text-lg">
                                  {getPieceSymbol(move.captured)}
                                </span>
                              </div>
                            )}
                            {move.promotion && (
                              <div className="mt-1 text-xs text-amber-300">
                                Promoted to {move.promotion.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-3">
                  Stack Structure
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-xs border border-cyan-500/20">
                  <div className="text-cyan-400 mb-2">Stack&lt;Move&gt;</div>
                  <div className="pl-4 space-y-1">
                    <div className="text-purple-400">
                      • push() → play a move
                    </div>
                    <div className="text-pink-400">
                      • pop() → Undo (restore prior ply)
                    </div>
                    <div className="text-gray-500">
                      • size: {moveStack.length}
                    </div>
                    {stackAnim && (
                      <div className="text-cyan-300">
                        • last op: {stackAnim}()
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Made by Ansh, Shubham, Aniket</p>
        </div>
      </div>
    </div>
  );
}
