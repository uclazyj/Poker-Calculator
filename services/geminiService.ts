
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

export const getStrategyAdvice = async (players: Player[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const scenario = players.map(p => {
    const handStr = p.hand.map(c => c ? `${c.rank}${c.suit}` : '??').join(' ');
    return `Player ${p.name}: Hand [${handStr}], Win Rate: ${(p.winRate * 100).toFixed(1)}%, Tie Rate: ${(p.tieRate * 100).toFixed(1)}%`;
  }).join('\n');

  const prompt = `
    I am using a poker equity calculator. Here is the current preflop situation:
    ${scenario}

    Based on these win rates and typical Texas Hold'em strategy (assuming cash game 100BB deep), provide a brief, professional strategic advice for the players. Focus on who should be aggressive and who should be cautious. 
    Format the response in clear Markdown with a "Strategic Overview" and "Player Recommendations" section. Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "Could not generate advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI strategist is currently unavailable.";
  }
};
