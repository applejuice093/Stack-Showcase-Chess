import type { Move } from "../chess/types";

/**
 * Explicit LIFO stack for chess move history.
 *
 * Why a stack (not just an array the UI mutates)?
 * - push / pop map 1:1 to "make move" / "undo"
 * - peek exposes the TOP of the stack for the sidebar highlight
 * - toArray returns a defensive copy so React state stays immutable
 *
 * The UI still stores `Move[]` in React state for re-renders; use
 * `MoveStack.fromArray` / `toArray` at the boundary when you need the
 * ADT API (tests, future redo-stack pairing, etc.).
 */
export class MoveStack {
  private items: Move[];

  constructor(initial: readonly Move[] = []) {
    this.items = initial.map((m) => this.clone(m));
  }

  static fromArray(moves: readonly Move[]): MoveStack {
    return new MoveStack(moves);
  }

  /** Structured clone so callers cannot mutate the stack through a peek/toArray result. */
  private clone(move: Move): Move {
    return {
      ...move,
      from: { ...move.from },
      to: { ...move.to },
      piece: move.piece ? { ...move.piece } : null,
      captured: move.captured ? { ...move.captured } : null,
      ...(move.castling
        ? {
            castling: {
              rookFrom: { ...move.castling.rookFrom },
              rookTo: { ...move.castling.rookTo },
            },
          }
        : {}),
      ...(move.enPassant ? { enPassant: { ...move.enPassant } } : {}),
    };
  }

  /** Push a completed ply onto the top of the stack. */
  push(move: Move): void {
    this.items.push(this.clone(move));
  }

  /**
   * Pop the most recent ply. Returns undefined when empty — callers
   * should guard (Undo button disabled) rather than throw.
   */
  pop(): Move | undefined {
    return this.items.pop();
  }

  /** Inspect the top move without removing it. */
  peek(): Move | undefined {
    if (this.items.length === 0) return undefined;
    return this.clone(this.items[this.items.length - 1]);
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  /** Snapshot for React state or serialization (oldest → newest). */
  toArray(): Move[] {
    return this.items.map((m) => this.clone(m));
  }

  /**
   * Newest-first view for the sidebar: index 0 is TOP (LIFO order
   * humans expect when reading a stack vertically).
   */
  toTopFirst(): Move[] {
    return this.items.map((m) => this.clone(m)).reverse();
  }
}
