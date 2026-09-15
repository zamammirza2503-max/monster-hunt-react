export type GameStatus = "menu" | "playing" | "paused" | "gameover";

export interface Player {
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  invulnerableUntil: number;
}

export interface Monster {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  hp: number;
  maxHp: number;
  hue: number;
  phase: number;
}

export interface GameSnapshot {
  score: number;
  level: number;
  elapsed: number;
  health: number;
  monsters: number;
  bestScore: number;

  keys: {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
  };
}