import { describe, expect, it } from "vitest";
import { MoveStack } from "@/lib/stack";
import type { Move } from "@/lib/chess";

const sample = (n: number): Move => ({
  from: { row: 6, col: n % 8 },
  to: { row: 4, col: n % 8 },
  piece: { type: "p", color: "w" },
  captured: null,
});

describe("MoveStack", () => {
  it("starts empty", () => {
    const stack = new MoveStack();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.size()).toBe(0);
    expect(stack.peek()).toBeUndefined();
    expect(stack.pop()).toBeUndefined();
  });

  it("push then peek returns the top without removing", () => {
    const stack = new MoveStack();
    const m = sample(0);
    stack.push(m);
    expect(stack.peek()).toEqual(m);
    expect(stack.size()).toBe(1);
  });

  it("pop is LIFO", () => {
    const stack = new MoveStack();
    const a = sample(1);
    const b = sample(2);
    stack.push(a);
    stack.push(b);
    expect(stack.pop()).toEqual(b);
    expect(stack.pop()).toEqual(a);
    expect(stack.isEmpty()).toBe(true);
  });

  it("toTopFirst lists newest first for the UI sidebar", () => {
    const stack = MoveStack.fromArray([sample(1), sample(2), sample(3)]);
    const topFirst = stack.toTopFirst();
    expect(topFirst[0]).toEqual(sample(3));
    expect(topFirst[2]).toEqual(sample(1));
    // Defensive copy — mutating the view must not alter the stack
    topFirst.pop();
    expect(stack.size()).toBe(3);
  });

  it("clear empties the history", () => {
    const stack = MoveStack.fromArray([sample(0), sample(1)]);
    stack.clear();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.toArray()).toEqual([]);
  });
});
