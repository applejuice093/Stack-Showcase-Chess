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
    this.items = [...initial];
  }

  static fromArray(moves: readonly Move[]): MoveStack {
    return new MoveStack(moves);
  }

  /** Push a completed ply onto the top of the stack. */
  push(move: Move): void {
    this.items.push(move);
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
    return this.items[this.items.length - 1];
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
    return [...this.items];
  }

  /**
   * Newest-first view for the sidebar: index 0 is TOP (LIFO order
   * humans expect when reading a stack vertically).
   */
  toTopFirst(): Move[] {
    return [...this.items].reverse();
  }
}
