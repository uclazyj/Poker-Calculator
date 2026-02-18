
import React from 'react';
import { Suit, Rank } from './types';

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const SUIT_SYMBOLS: Record<Suit, { char: string; color: string; label: string }> = {
  H: { char: '♥', color: 'text-red-500', label: 'Hearts' },
  D: { char: '♦', color: 'text-blue-500', label: 'Diamonds' },
  C: { char: '♣', color: 'text-green-500', label: 'Clubs' },
  S: { char: '♠', color: 'text-slate-400', label: 'Spades' }
};

export const RANK_LABELS: Record<Rank, string> = {
  'A': 'A', 'K': 'K', 'Q': 'Q', 'J': 'J', 'T': '10',
  '9': '9', '8': '8', '7': '7', '6': '6', '5': '5',
  '4': '4', '3': '3', '2': '2'
};
