import { Heart, Shield, Skull, Trophy, Zap } from "lucide-react";
import type { GameSnapshot } from "../types";

export default function HUD({ s }: { s: GameSnapshot }) {
  return <div className="hud">
    <div className="stat"><Trophy size={17}/><span>Score</span><strong>{s.score}</strong></div>
    <div className="stat"><Zap size={17}/><span>Level</span><strong>{s.level}</strong></div>
    <div className="stat"><Skull size={17}/><span>Hunted</span><strong>{s.score}</strong></div>
    <div className="stat"><Shield size={17}/><span>Best</span><strong>{s.bestScore}</strong></div>
    <div className="health">{[0,1,2].map(i=><Heart key={i} size={18} fill={i<s.health ? "currentColor":"transparent"} className={i<s.health?"alive":""}/>)}</div>
  </div>;
}