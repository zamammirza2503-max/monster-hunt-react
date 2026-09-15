import { describe, expect, it } from "vitest";
import { clamp, circlesOverlap, levelForScore } from "./game";

describe("game utilities", () => {
  it("clamps a value to the arena bounds", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("detects circular collision", () => {
    expect(circlesOverlap({x:0,y:0,size:40},{x:10,y:0,size:30})).toBe(true);
    expect(circlesOverlap({x:0,y:0,size:20},{x:100,y:0,size:20})).toBe(false);
  });

  it("increases level every five captures", () => {
    expect(levelForScore(0)).toBe(1);
    expect(levelForScore(4)).toBe(1);
    expect(levelForScore(5)).toBe(2);
    expect(levelForScore(15)).toBe(4);
  });
});