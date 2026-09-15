import { useRef } from "react";

import {
  Gamepad2,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { WORLD } from "./game";
import { useGame } from "./useGame";

function App() {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const {
    status,
    snapshot,
    start,
    togglePause,
  } = useGame(canvasRef);

  const formatTime = (
    seconds: number
  ) => {
    const minutes =
      Math.floor(seconds / 60);

    const secs =
      Math.floor(seconds % 60);

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <main className="app">
      {/* =========================================
          HEADER
      ========================================= */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Gamepad2 size={20} />
          </div>

          <div>
            <div className="brand-title">
              MONSTER HUNT
            </div>

            <div className="brand-subtitle">
              React × TypeScript × Canvas
            </div>
          </div>
        </div>

        {/* =========================================
            TOP ACTIONS
        ========================================= */}

        <div className="topbar-actions">
          {status === "playing" && (
            <>
              <button
                className="secondary-button"
                onClick={togglePause}
                type="button"
              >
                <Pause size={16} />
                Pause
              </button>

              <button
                className="secondary-button"
                onClick={start}
                type="button"
              >
                <RotateCcw size={16} />
                Restart
              </button>
            </>
          )}

          {status === "paused" && (
            <>
              <button
                className="primary-button"
                onClick={togglePause}
                type="button"
              >
                <Play size={16} />
                Resume
              </button>

              <button
                className="secondary-button"
                onClick={start}
                type="button"
              >
                <RotateCcw size={16} />
                Restart
              </button>
            </>
          )}
        </div>
      </header>

      {/* =========================================
          GAME
      ========================================= */}

      <section className="game-shell">

        {/* =========================================
            HUD
        ========================================= */}

        <div className="hud">
          <div className="stat">
            <span>Score</span>

            <strong>
              {snapshot.score}
            </strong>
          </div>

          <div className="stat">
            <span>Level</span>

            <strong>
              {snapshot.level}
            </strong>
          </div>

          <div className="stat">
            <span>Time</span>

            <strong>
              {formatTime(
                snapshot.elapsed
              )}
            </strong>
          </div>

          <div className="stat">
            <span>Best</span>

            <strong>
              {snapshot.bestScore}
            </strong>
          </div>
        </div>

        {/* =========================================
            CANVAS
        ========================================= */}

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={WORLD.width}
            height={WORLD.height}
            tabIndex={0}
            className="game-canvas"
            aria-label="Monster Hunt game"
          />

          {/* =======================================
              MAIN MENU
          ======================================= */}

          {status === "menu" && (
            <div className="overlay">
              <div className="overlay-card">

                <div className="overlay-icon">
                  <Gamepad2 size={32} />
                </div>

                <p className="eyebrow">
                  REACT CANVAS GAME
                </p>

                <h1>
                  MONSTER HUNT
                </h1>

                <p className="description">
                  Chase the monsters,
                  survive the arena,
                  and beat your high
                  score.
                </p>

                {/* Controls */}

                <div className="controls">
                  <div>
                    <span>W</span>
                    <span>A</span>
                    <span>S</span>
                    <span>D</span>
                  </div>

                  <small>
                    Move your player
                  </small>
                </div>

                {/* Start */}

                <button
                  className="start-button"
                  onClick={start}
                  type="button"
                >
                  <Play size={18} />
                  Start Hunt
                </button>
              </div>
            </div>
          )}

          {/* =======================================
              PAUSE SCREEN
          ======================================= */}

          {status === "paused" && (
            <div className="overlay">
              <div className="overlay-card">

                <div className="overlay-icon">
                  <Pause size={28} />
                </div>

                <p className="eyebrow">
                  GAME PAUSED
                </p>

                <h1>
                  TAKE A BREATH
                </h1>

                <p className="description">
                  Your progress is saved
                  while the game is paused.
                </p>

                <button
                  className="start-button"
                  onClick={togglePause}
                  type="button"
                >
                  <Play size={18} />
                  Resume
                </button>

              </div>
            </div>
          )}
        </div>

        {/* =========================================
            KEYBOARD STATUS
        ========================================= */}

        <div className="keyboard-status">
          <span className="keyboard-label">
            KEYBOARD
          </span>

          <div className="key-indicators">

            <div
              className={
                snapshot.keys.w
                  ? "key active"
                  : "key"
              }
            >
              W
            </div>

            <div
              className={
                snapshot.keys.a
                  ? "key active"
                  : "key"
              }
            >
              A
            </div>

            <div
              className={
                snapshot.keys.s
                  ? "key active"
                  : "key"
              }
            >
              S
            </div>

            <div
              className={
                snapshot.keys.d
                  ? "key active"
                  : "key"
              }
            >
              D
            </div>

          </div>

          <span className="keyboard-help">
            Hold W A S D to move
          </span>
        </div>

        {/* =========================================
            FOOTER
        ========================================= */}

        <div className="game-footer">
          <span>
            Monsters:{" "}
            <strong>
              {snapshot.monsters}
            </strong>
          </span>

          <span>
            Controls:{" "}
            <strong>
              WASD
            </strong>
          </span>

          <span>
            Time:{" "}
            <strong>
              {formatTime(
                snapshot.elapsed
              )}
            </strong>
          </span>
        </div>

      </section>
    </main>
  );
}

export default App;