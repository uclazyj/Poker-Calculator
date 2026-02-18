
import React from 'react';
import { Player, Card } from '../types';
import CardDisplay from './CardDisplay';

interface PlayerRowProps {
  player: Player;
  onCardClick: (playerIndex: number, cardIndex: number) => void;
  onRemove: () => void;
  index: number;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, onCardClick, onRemove, index }) => {
  const winPercent = (player.winRate * 100).toFixed(1);
  const tiePercent = (player.tieRate * 100).toFixed(1);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Player {index + 1}</span>
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
      </div>

      <div className="flex gap-2">
        <CardDisplay card={player.hand[0]} onClick={() => onCardClick(index, 0)} />
        <CardDisplay card={player.hand[1]} onClick={() => onCardClick(index, 1)} />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <span className="text-emerald-400 font-bold text-2xl">{winPercent}%</span>
          <span className="text-slate-500 text-xs">Win Probability</span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000" 
            style={{ width: `${winPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-medium uppercase tracking-widest">
          <span>Tie: {tiePercent}%</span>
          <span>Loss: {(100 - parseFloat(winPercent) - parseFloat(tiePercent)).toFixed(1)}%</span>
        </div>
      </div>

      <button 
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
      >
        <i className="fas fa-trash-can"></i>
      </button>
    </div>
  );
};

export default PlayerRow;
