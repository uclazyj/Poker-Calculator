
import React from 'react';
import { Card, Suit, Rank } from '../types';
import { SUITS, RANKS, SUIT_SYMBOLS, RANK_LABELS } from '../constants';

interface CardPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
  unavailableCards: Set<string>;
}

const CardPicker: React.FC<CardPickerProps> = ({ isOpen, onClose, onSelect, unavailableCards }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h3 className="text-xl font-bold">Select a Card</h3>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">One row per suit for quick selection</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            aria-label="Close picker"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {SUITS.map(suit => (
            <div key={suit} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                 <span className={`text-sm font-bold uppercase tracking-widest w-24 shrink-0 ${SUIT_SYMBOLS[suit].color}`}>
                    {SUIT_SYMBOLS[suit].label}
                 </span>
                 <div className="flex-1 h-px bg-slate-800/50"></div>
              </div>
              
              {/* Horizontal Scrollable Row for the suit */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-slate-700">
                {RANKS.map(rank => {
                  const isUsed = unavailableCards.has(`${rank}${suit}`);
                  const { char, color } = SUIT_SYMBOLS[suit];
                  
                  return (
                    <button
                      key={`${rank}${suit}`}
                      disabled={isUsed}
                      onClick={() => onSelect({ rank, suit })}
                      className={`
                        w-12 h-16 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center transition-all relative
                        ${isUsed 
                          ? 'bg-slate-800 border-slate-800 text-slate-700 cursor-not-allowed opacity-30 shadow-none' 
                          : 'bg-white border-transparent hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95'
                        }
                      `}
                    >
                      <span className={`text-[10px] font-bold leading-none absolute top-1.5 left-1.5 ${!isUsed ? color : ''}`}>
                        {RANK_LABELS[rank]}
                      </span>
                      <span className={`text-2xl leading-none mt-1 ${color}`}>{char}</span>
                      <span className={`text-[10px] font-bold leading-none absolute bottom-1.5 right-1.5 rotate-180 ${!isUsed ? color : ''}`}>
                        {RANK_LABELS[rank]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPicker;
