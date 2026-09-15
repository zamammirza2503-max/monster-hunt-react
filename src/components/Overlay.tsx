import { Crosshair, Pause, Play, RotateCcw, Trophy } from "lucide-react";
import type { GameStatus, GameSnapshot } from "../types";

interface Props { status: GameStatus; s: GameSnapshot; onStart:()=>void; onResume:()=>void; }

export default function Overlay({status,s,onStart,onResume}:Props) {
  if (status==="playing") return null;
  if (status==="paused") return <div className="overlay"><div className="modal">
    <div className="icon-badge"><Pause/></div><h2>Game Paused</h2><p>Take a breath. The monsters are waiting.</p>
    <button onClick={onResume}><Play size={18}/> Resume Hunt</button>
  </div></div>;
  if (status==="gameover") return <div className="overlay"><div className="modal">
    <div className="icon-badge danger"><Trophy/></div><p className="eyebrow">HUNT COMPLETE</p><h2>{s.score} monsters captured</h2>
    <div className="result"><span>Final score</span><strong>{s.score}</strong></div>
    <div className="result"><span>Best score</span><strong>{s.bestScore}</strong></div>
    <button onClick={onStart}><RotateCcw size={18}/> Hunt Again</button>
  </div></div>;
  return <div className="overlay"><div className="modal hero-modal">
    <div className="icon-badge"><Crosshair/></div><p className="eyebrow">REACT CANVAS GAME</p><h1>MONSTER HUNT</h1>
    <p>Chase neon creatures, survive the arena, and beat your high score.</p>
    <div className="controls"><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> Move</span><span><kbd>ESC</kbd> Pause</span></div>
    <button onClick={onStart}><Play size={18}/> Start Hunt</button>
  </div></div>;
}