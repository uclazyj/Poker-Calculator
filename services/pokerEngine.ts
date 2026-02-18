
import { Card, Rank, Suit, HandRank } from '../types';

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const getRankValue = (r: Rank) => RANK_VALUES[r];

export class PokerEngine {
  private static createDeck(): Card[] {
    const deck: Card[] = [];
    const suits: Suit[] = ['H', 'D', 'C', 'S'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    for (const s of suits) {
      for (const r of ranks) {
        deck.push({ suit: s, rank: r });
      }
    }
    return deck;
  }

  private static shuffle(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  // Simplified evaluator for win-rate calculation speed
  // Returns a score where higher is better.
  // Format: [HandCategory (0-9), RankValues sorted for comparison]
  private static evaluateHand(cards: Card[]): number {
    const sorted = [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
    const ranks = sorted.map(c => getRankValue(c.rank));
    const suits = sorted.map(c => c.suit);

    const counts: Record<number, number> = {};
    ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
    const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => b - a);
    
    // Check Flush
    let flushSuit: Suit | null = null;
    const suitCounts: Record<string, number> = {};
    cards.forEach(c => {
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
      if (suitCounts[c.suit] >= 5) flushSuit = c.suit;
    });

    const isFlush = !!flushSuit;
    const flushCards = isFlush ? cards.filter(c => c.suit === flushSuit).sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank)) : [];

    // Check Straight
    const distinctRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
    let straightHigh = -1;
    for (let i = 0; i <= distinctRanks.length - 5; i++) {
      if (distinctRanks[i] - distinctRanks[i + 4] === 4) {
        straightHigh = distinctRanks[i];
        break;
      }
    }
    // Low straight A-2-3-4-5
    if (straightHigh === -1 && [14, 5, 4, 3, 2].every(r => distinctRanks.includes(r))) {
      straightHigh = 5;
    }

    const isStraight = straightHigh !== -1;

    // Straight Flush
    if (isFlush && isStraight) {
        // Need to check if the specific suit has a straight
        const fRanks = flushCards.map(c => getRankValue(c.rank));
        let sfHigh = -1;
        for (let i = 0; i <= fRanks.length - 5; i++) {
            if (fRanks[i] - fRanks[i + 4] === 4) {
                sfHigh = fRanks[i];
                break;
            }
        }
        if (sfHigh === -1 && [14, 5, 4, 3, 2].every(r => fRanks.includes(r))) sfHigh = 5;
        if (sfHigh !== -1) return HandRank.STRAIGHT_FLUSH * 1e10 + sfHigh;
    }

    const groups = Object.entries(counts).map(([r, c]) => ({ rank: Number(r), count: c })).sort((a, b) => b.count - a.count || b.rank - a.rank);

    // 4 of a kind
    if (groups[0].count === 4) return HandRank.FOUR_OF_A_KIND * 1e10 + groups[0].rank * 100 + groups[1].rank;

    // Full House
    if (groups[0].count === 3 && groups[1].count >= 2) return HandRank.FULL_HOUSE * 1e10 + groups[0].rank * 100 + groups[1].rank;

    // Flush
    // Fixed Error: Property 'rankValue' does not exist on type 'Card'. Using getRankValue to fetch the score.
    if (isFlush) return HandRank.FLUSH * 1e10 + getRankValue(flushCards[0].rank) * 10000; // Simplified scoring for brevity

    // Straight
    if (isStraight) return HandRank.STRAIGHT * 1e10 + straightHigh;

    // 3 of a kind
    if (groups[0].count === 3) return HandRank.THREE_OF_A_KIND * 1e10 + groups[0].rank * 10000 + groups[1].rank * 100 + groups[2].rank;

    // 2 pair
    if (groups[0].count === 2 && groups[1].count === 2) return HandRank.TWO_PAIR * 1e10 + groups[0].rank * 10000 + groups[1].rank * 100 + groups[2].rank;

    // Pair
    if (groups[0].count === 2) return HandRank.PAIR * 1e10 + groups[0].rank * 1000000 + groups[1].rank * 10000 + groups[2].rank * 100 + groups[3].rank;

    // High Card
    // Fixed Error: Property 'rank' does not exist on type 'number'. ranks[2] is already a rank value number.
    return HandRank.HIGH_CARD * 1e10 + ranks[0] * 1000000 + ranks[1] * 10000 + ranks[2] * 100 + ranks[3];
  }

  // Optimized for Preflop Simulation
  public static runSimulation(playerHands: Card[][], iterations: number = 2000): { wins: number[], ties: number[] } {
    const numPlayers = playerHands.length;
    const wins = new Array(numPlayers).fill(0);
    const ties = new Array(numPlayers).fill(0);

    const usedCards = new Set(playerHands.flat().map(c => `${c.rank}${c.suit}`));
    const fullDeck = this.createDeck();
    const availableDeck = fullDeck.filter(c => !usedCards.has(`${c.rank}${c.suit}`));

    for (let i = 0; i < iterations; i++) {
      const shuffled = this.shuffle([...availableDeck]);
      const community = shuffled.slice(0, 5);
      
      let maxScore = -1;
      let winners: number[] = [];

      for (let p = 0; p < numPlayers; p++) {
        const score = this.evaluateHand([...playerHands[p], ...community]);
        if (score > maxScore) {
          maxScore = score;
          winners = [p];
        } else if (score === maxScore) {
          winners.push(p);
        }
      }

      if (winners.length === 1) {
        wins[winners[0]]++;
      } else {
        winners.forEach(w => ties[w]++);
      }
    }

    return { wins, ties };
  }
}
