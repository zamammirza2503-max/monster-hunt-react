import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  WORLD,
  circlesOverlap,
  levelForScore,
  movePlayer,
  spawnMonster,
  updateMonsters,
} from "./game";

import type {
  GameSnapshot,
  GameStatus,
  Monster,
  Player,
} from "./types";

interface UseGameResult {
  status: GameStatus;
  snapshot: GameSnapshot;
  start: () => void;
  togglePause: () => void;
}

const MOVEMENT_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
]);

function emptyKeys() {
  return {
    w: false,
    a: false,
    s: false,
    d: false,
  };
}

export function useGame(
  canvasRef: React.RefObject<HTMLCanvasElement>
): UseGameResult {
  const [status, setStatus] =
    useState<GameStatus>("menu");

  const [snapshot, setSnapshot] =
    useState<GameSnapshot>(() => ({
      score: 0,
      level: 1,
      elapsed: 0,
      health: 3,
      monsters: 0,
      bestScore: Number(
        localStorage.getItem(
          "monster-hunt-best"
        ) ?? 0
      ),
      keys: emptyKeys(),
    }));

  /*
   * IMPORTANT:
   *
   * These refs contain the actual game state.
   * React state is NOT used for movement.
   */

  const playerRef =
    useRef<Player>({
      x: WORLD.width / 2,
      y: WORLD.height / 2,
      size: 30,
      speed: 300,
      health: 3,
      invulnerableUntil: 0,
    });

  const monstersRef =
    useRef<Monster[]>([]);

  const keysRef =
    useRef<Set<string>>(new Set());

  const scoreRef =
    useRef(0);

  const elapsedRef =
    useRef(0);

  const spawnTimerRef =
    useRef(0);

  const nextMonsterId =
    useRef(1);

  /*
   * Reset everything.
   */
  const resetGame = useCallback(() => {
    playerRef.current = {
      x: WORLD.width / 2,
      y: WORLD.height / 2,
      size: 30,
      speed: 300,
      health: 3,
      invulnerableUntil: 0,
    };

    monstersRef.current = [];

    keysRef.current.clear();

    scoreRef.current = 0;

    elapsedRef.current = 0;

    spawnTimerRef.current = 0;

    nextMonsterId.current = 1;

    setSnapshot({
      score: 0,
      level: 1,
      elapsed: 0,
      health: 3,
      monsters: 0,
      bestScore: Number(
        localStorage.getItem(
          "monster-hunt-best"
        ) ?? 0
      ),
      keys: emptyKeys(),
    });
  }, []);

  /*
   * Start game.
   */
  const start = useCallback(() => {
    resetGame();

    setStatus("playing");

    /*
     * Focus canvas.
     */
    requestAnimationFrame(() => {
      canvasRef.current?.focus();
    });
  }, [canvasRef, resetGame]);

  /*
   * Pause / resume.
   */
  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "playing") {
        keysRef.current.clear();

        return "paused";
      }

      if (current === "paused") {
        requestAnimationFrame(() => {
          canvasRef.current?.focus();
        });

        return "playing";
      }

      return current;
    });
  }, [canvasRef]);

  /*
   * =====================================================
   * KEYBOARD INPUT
   * =====================================================
   */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      const key =
        event.key.toLowerCase();

      /*
       * DEBUG:
       * You can see the pressed key in DevTools.
       */
      console.log(
        "GAME KEY DOWN:",
        event.key,
        "=>",
        key
      );

      if (MOVEMENT_KEYS.has(key)) {
        event.preventDefault();

        keysRef.current.add(key);

        /*
         * Update visual keyboard indicator.
         */
        setSnapshot((previous) => ({
          ...previous,
          keys: {
            ...previous.keys,
            [key]: true,
          },
        }));

        return;
      }

      if (key === "escape") {
        event.preventDefault();

        if (
          status === "playing" ||
          status === "paused"
        ) {
          togglePause();
        }
      }
    };

    const handleKeyUp = (
      event: KeyboardEvent
    ) => {
      const key =
        event.key.toLowerCase();

      if (MOVEMENT_KEYS.has(key)) {
        event.preventDefault();

        keysRef.current.delete(key);

        setSnapshot((previous) => ({
          ...previous,
          keys: {
            ...previous.keys,
            [key]: false,
          },
        }));
      }
    };

    /*
     * Capture phase = true.
     *
     * This makes the game receive the
     * keyboard event before child elements.
     */
    window.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    window.addEventListener(
      "keyup",
      handleKeyUp,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp,
        true
      );
    };
  }, [
    status,
    togglePause,
  ]);

  /*
   * =====================================================
   * GAME LOOP
   * =====================================================
   */

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      console.error(
        "Game canvas not found."
      );

      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      console.error(
        "Could not create 2D canvas context."
      );

      return;
    }

    let animationId = 0;

    let previousTime = performance.now();

    /*
     * Canvas always has the internal game resolution.
     */
    canvas.width = WORLD.width;
    canvas.height = WORLD.height;

    const render = (
      currentTime: number
    ) => {
      const rawDelta =
        (currentTime -
          previousTime) /
        1000;

      previousTime =
        currentTime;

      /*
       * Prevent giant jumps after
       * switching tabs.
       */
      const dt = Math.min(
        rawDelta,
        0.05
      );

      const player =
        playerRef.current;

      const monsters =
        monstersRef.current;

      /*
       * =================================================
       * UPDATE GAME
       * =================================================
       */

      if (status === "playing") {
        /*
         * THIS IS THE CRITICAL LINE.
         *
         * WASD keys -> movePlayer -> player position
         */
        movePlayer(
          player,
          keysRef.current,
          dt
        );

        elapsedRef.current += dt;

        /*
         * Spawn monsters.
         */
        spawnTimerRef.current -= dt;

        const level =
          levelForScore(
            scoreRef.current
          );

        if (
          spawnTimerRef.current <= 0
        ) {
          monsters.push(
            spawnMonster(
              monsters,
              level,
              nextMonsterId.current
            )
          );

          nextMonsterId.current +=
            1;

          spawnTimerRef.current =
            Math.max(
              0.35,
              1.1 -
                level * 0.06
            );
        }

        /*
         * Move monsters.
         */
        updateMonsters(
          monsters,
          player,
          dt,
          currentTime
        );

        /*
         * Capture monsters.
         */
        for (
          let i =
            monsters.length - 1;
          i >= 0;
          i--
        ) {
          const monster =
            monsters[i];

          if (
            circlesOverlap(
              player,
              monster
            )
          ) {
            monsters.splice(
              i,
              1
            );

            scoreRef.current +=
              1;

            const oldBest =
              Number(
                localStorage.getItem(
                  "monster-hunt-best"
                ) ?? 0
              );

            const newBest =
              Math.max(
                scoreRef.current,
                oldBest
              );

            localStorage.setItem(
              "monster-hunt-best",
              String(newBest)
            );
          }
        }

        /*
         * Update HUD.
         */
        setSnapshot({
          score:
            scoreRef.current,

          level:
            levelForScore(
              scoreRef.current
            ),

          elapsed:
            elapsedRef.current,

          health:
            player.health,

          monsters:
            monsters.length,

          bestScore:
            Math.max(
              scoreRef.current,
              Number(
                localStorage.getItem(
                  "monster-hunt-best"
                ) ?? 0
              )
            ),

          keys: {
            w: keysRef.current.has(
              "w"
            ),
            a: keysRef.current.has(
              "a"
            ),
            s: keysRef.current.has(
              "s"
            ),
            d: keysRef.current.has(
              "d"
            ),
          },
        });
      }

      /*
       * =================================================
       * DRAW
       * =================================================
       */

      ctx.clearRect(
        0,
        0,
        WORLD.width,
        WORLD.height
      );

      /*
       * Background.
       */
      ctx.fillStyle =
        "#07111f";

      ctx.fillRect(
        0,
        0,
        WORLD.width,
        WORLD.height
      );

      /*
       * Grid.
       */
      ctx.strokeStyle =
        "rgba(255,255,255,0.045)";

      ctx.lineWidth = 1;

      const grid = 48;

      for (
        let x = 0;
        x <= WORLD.width;
        x += grid
      ) {
        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
          x,
          WORLD.height
        );

        ctx.stroke();
      }

      for (
        let y = 0;
        y <= WORLD.height;
        y += grid
      ) {
        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
          WORLD.width,
          y
        );

        ctx.stroke();
      }

      /*
       * Center marker.
       */
      ctx.strokeStyle =
        "rgba(102,227,255,0.08)";

      ctx.beginPath();

      ctx.arc(
        WORLD.width / 2,
        WORLD.height / 2,
        120,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      /*
       * Monsters.
       */
      for (
        const monster of monsters
      ) {
        ctx.save();

        ctx.translate(
          monster.x,
          monster.y
        );

        const pulse =
          Math.sin(
            currentTime * 0.004 +
              monster.phase
          ) *
          2;

        /*
         * Glow.
         */
        ctx.shadowBlur = 25;

        ctx.shadowColor =
          `hsl(${monster.hue}, 90%, 60%)`;

        ctx.fillStyle =
          `hsl(${monster.hue}, 75%, 55%)`;

        ctx.beginPath();

        ctx.arc(
          0,
          0,
          monster.size / 2 +
            pulse,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * Eyes.
         */
        ctx.shadowBlur = 0;

        ctx.fillStyle =
          "#ffffff";

        ctx.beginPath();

        ctx.arc(
          -monster.size *
            0.16,
          -monster.size *
            0.08,
          3,
          0,
          Math.PI * 2
        );

        ctx.arc(
          monster.size *
            0.16,
          -monster.size *
            0.08,
          3,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * Mouth.
         */
        ctx.strokeStyle =
          "rgba(0,0,0,0.5)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
          0,
          2,
          monster.size * 0.18,
          0,
          Math.PI
        );

        ctx.stroke();

        ctx.restore();
      }

      /*
       * =================================================
       * PLAYER
       * =================================================
       */

      ctx.save();

      ctx.translate(
        player.x,
        player.y
      );

      /*
       * Player glow.
       */
      ctx.shadowBlur = 30;

      ctx.shadowColor =
        "#66e3ff";

      ctx.fillStyle =
        "#66e3ff";

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        player.size / 2,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Player inner circle.
       */
      ctx.shadowBlur = 0;

      ctx.fillStyle =
        "#ffffff";

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        player.size *
          0.18,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Direction indicator.
       */
      ctx.fillStyle =
        "rgba(7,17,31,0.7)";

      ctx.beginPath();

      ctx.moveTo(
        0,
        -player.size * 0.42
      );

      ctx.lineTo(
        -5,
        -player.size * 0.15
      );

      ctx.lineTo(
        5,
        -player.size * 0.15
      );

      ctx.closePath();

      ctx.fill();

      ctx.restore();

      /*
       * Continue animation.
       */
      animationId =
        requestAnimationFrame(
          render
        );
    };

    animationId =
      requestAnimationFrame(
        render
      );

    return () => {
      cancelAnimationFrame(
        animationId
      );
    };
  }, [canvasRef, status]);

  return {
    status,
    snapshot,
    start,
    togglePause,
  };
}