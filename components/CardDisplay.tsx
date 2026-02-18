
import React from 'react';
import { Card } from '../types';
import { SUIT_SYMBOLS, RANK_LABELS } from '../constants';

interface CardDisplayProps {
  card: Card | null;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onClick, className = "", size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-xs',
    md: 'w-16 h-24 text-lg',
    lg: 'w-20 h-28 text-xl'
  };

  if (!card) {
    return (
      <div 
        onClick={onClick}
        className={`bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors ${sizeClasses[size]} ${className}`}
      >
        <span className="text-slate-500 font-bold">?</span>
      </div>
    );
  }

  const { char, color } = SUIT_SYMBOLS[card.suit];

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-lg flex flex-col justify-between p-1.5 cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all select-none ${sizeClasses[size]} ${className}`}
    >
      <div className={`font-bold leading-none ${color}`}>
        {RANK_LABELS[card.rank]}
      </div>
      <div className={`text-center text-2xl ${color}`}>
        {char}
      </div>
      <div className={`font-bold leading-none self-end rotate-180 ${color}`}>
        {RANK_LABELS[card.rank]}
      </div>
    </div>
  );
};

export default CardDisplay;
