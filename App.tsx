
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Player, Card } from './types';
import PlayerRow from './components/PlayerRow';
import CardPicker from './components/CardPicker';
import { PokerEngine } from './services/pokerEngine';
import { getStrategyAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', hand: [null, null], winRate: 0, tieRate: 0, isCalculating: false },
    { id: '2', name: 'Player 2', hand: [null, null], winRate: 0, tieRate: 0, isCalculating: false }
  ]);

  const [pickerState, setPickerState] = useState<{ isOpen: boolean; playerIndex: number; cardIndex: number }>({
    isOpen: false,
    playerIndex: -1,
    cardIndex: -1
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [strategyAdvice, setStrategyAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const unavailableCards = useMemo(() => {
    const used = new Set<string>();
    players.forEach(p => {
      p.hand.forEach(c => {
        if (c) used.add(`${c.rank}${c.suit}`);
      });
    });
    return used;
  }, [players]);

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, { 
        id: Date.now().toString(), 
        name: `Player ${players.length + 1}`, 
        hand: [null, null], 
        winRate: 0, 
        tieRate: 0,
        isCalculating: false 
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleCardClick = (playerIndex: number, cardIndex: number) => {
    setPickerState({ isOpen: true, playerIndex, cardIndex });
  };

  const handleCardSelect = (card: Card) => {
    const newPlayers = [...players];
    newPlayers[pickerState.playerIndex].hand[pickerState.cardIndex] = card;
    setPlayers(newPlayers);
    setPickerState({ ...pickerState, isOpen: false });
  };

  const runSimulation = useCallback(async () => {
    // Validate: All players must have 2 cards
    const readyPlayers = players.filter(p => p.hand[0] && p.hand[1]);
    if (readyPlayers.length < 2) {
      alert("At least 2 players must have both cards selected.");
      return;
    }

    setIsCalculating(true);
    setStrategyAdvice(null);

    // Mock delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const playerHands = readyPlayers.map(p => p.hand as Card[]);
    const results = PokerEngine.runSimulation(playerHands, 10000);

    const total = 10000;
    const updatedPlayers = players.map(p => {
        const idx = readyPlayers.findIndex(rp => rp.id === p.id);
        if (idx !== -1) {
            return {
                ...p,
                winRate: results.wins[idx] / total,
                tieRate: results.ties[idx] / total
            };
        }
        return { ...p, winRate: 0, tieRate: 0 };
    });

    setPlayers(updatedPlayers);
    setIsCalculating(false);
  }, [players]);

  const requestAiAnalysis = async () => {
    if (players.some(p => p.winRate === 0)) {
        alert("Please calculate win rates first.");
        return;
    }
    setIsAiLoading(true);
    const advice = await getStrategyAdvice(players);
    setStrategyAdvice(advice);
    setIsAiLoading(false);
  };

  const resetAll = () => {
    setPlayers(players.map(p => ({ ...p, hand: [null, null], winRate: 0, tieRate: 0 })));
    setStrategyAdvice(null);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fas fa-clover text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Poker Calculator</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Poker Equity Engine</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
                onClick={resetAll}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                Reset
            </button>
            <button 
              onClick={addPlayer}
              disabled={players.length >= 10}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <i className="fas fa-plus mr-2"></i> Add Player
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8">
        {/* Left Column: Player Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-300">Hands Setup</h2>
            <span className="text-xs text-slate-500">{players.length} Players Table</span>
          </div>
          
          <div className="space-y-3">
            {players.map((player, idx) => (
              <PlayerRow 
                key={player.id} 
                player={player} 
                index={idx}
                onCardClick={handleCardClick}
                onRemove={() => removePlayer(idx)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <i className="fas fa-microchip text-emerald-500"></i>
              Control Panel
            </h3>

            <div className="space-y-4">
              <button
                onClick={runSimulation}
                disabled={isCalculating}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                  ${isCalculating 
                    ? 'bg-slate-700 cursor-not-allowed text-slate-500' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:-translate-y-1 active:translate-y-0'
                  }
                `}
              >
                {isCalculating ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    Simulating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Calculate Equity
                  </>
                )}
              </button>

              <button
                onClick={requestAiAnalysis}
                disabled={isAiLoading || isCalculating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/40 text-white flex items-center justify-center gap-3 transition-all"
              >
                {isAiLoading ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                    <i className="fas fa-brain"></i>
                )}
                Get AI Strategy
              </button>
            </div>

            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Simulation Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-slate-400">Iterations</p>
                        <p className="text-lg font-mono font-bold">10,000</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Accuracy</p>
                        <p className="text-lg font-mono font-bold text-emerald-400">High</p>
                    </div>
                </div>
            </div>

            {strategyAdvice && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-400 prose-headings:text-indigo-300">
                    <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold">
                        <i className="fas fa-robot"></i>
                        AI Insights
                    </div>
                    <div className="text-sm leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {strategyAdvice.split('\n').map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <CardPicker 
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState({ ...pickerState, isOpen: false })}
        onSelect={handleCardSelect}
        unavailableCards={unavailableCards}
      />

      {/* Footer / Mobile Sticky Action */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800 p-4 md:hidden flex gap-2">
         <button
            onClick={runSimulation}
            disabled={isCalculating}
            className="flex-1 py-3 bg-emerald-600 rounded-lg font-bold text-white shadow-lg"
          >
            {isCalculating ? '...' : 'Calculate'}
          </button>
          <button
            onClick={requestAiAnalysis}
            disabled={isAiLoading}
            className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold text-white shadow-lg"
          >
            AI Insight
          </button>
      </footer>
    </div>
  );
};

export default App;
