import type { Monster, Player } from "./types";

export const WORLD = {
  width: 960,
  height: 540,
};

export function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, value));
}

export function distance(
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  return Math.hypot(ax - bx, ay - by);
}

export function circlesOverlap(
  a: { x: number; y: number; size: number },
  b: { x: number; y: number; size: number }
) {
  const radiusA = a.size / 2;
  const radiusB = b.size / 2;

  return (
    distance(a.x, a.y, b.x, b.y) <
    radiusA + radiusB
  );
}

/**
 * Move player using currently pressed keys.
 *
 * keys must contain lowercase values:
 * w, a, s, d
 */
export function movePlayer(
  player: Player,
  keys: Set<string>,
  dt: number
) {
  let dx = 0;
  let dy = 0;

  if (keys.has("a")) {
    dx -= 1;
  }

  if (keys.has("d")) {
    dx += 1;
  }

  if (keys.has("w")) {
    dy -= 1;
  }

  if (keys.has("s")) {
    dy += 1;
  }

  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);

    dx /= length;
    dy /= length;

    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
  }

  const radius = player.size / 2;

  player.x = clamp(
    player.x,
    radius,
    WORLD.width - radius
  );

  player.y = clamp(
    player.y,
    radius,
    WORLD.height - radius
  );
}

export function updateMonsters(
  monsters: Monster[],
  player: Player,
  dt: number,
  now: number
) {
  for (const monster of monsters) {
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;

    const length = Math.hypot(dx, dy) || 1;

    const wobble =
      Math.sin(
        now * 0.003 + monster.phase
      ) * 0.18;

    const vx =
      dx / length -
      (dy / length) * wobble;

    const vy =
      dy / length +
      (dx / length) * wobble;

    monster.x +=
      vx * monster.speed * dt;

    monster.y +=
      vy * monster.speed * dt;
  }
}

export function spawnMonster(
  existing: Monster[],
  level: number,
  nextId: number
): Monster {
  let x = 0;
  let y = 0;

  for (let i = 0; i < 30; i++) {
    x =
      55 +
      Math.random() *
        (WORLD.width - 110);

    y =
      55 +
      Math.random() *
        (WORLD.height - 110);

    if (
      distance(
        x,
        y,
        WORLD.width / 2,
        WORLD.height / 2
      ) > 180
    ) {
      break;
    }
  }

  const size =
    28 + Math.random() * 16;

  const hp = Math.min(
    3,
    1 + Math.floor(level / 4)
  );

  return {
    id: nextId,
    x,
    y,
    size,
    speed:
      48 +
      level * 7 +
      Math.random() * 25,
    hp,
    maxHp: hp,
    hue:
      Math.random() > 0.5
        ? 165
        : 280,
    phase:
      Math.random() *
      Math.PI *
      2,
  };
}

export function levelForScore(
  score: number
) {
  return 1 + Math.floor(score / 5);
}