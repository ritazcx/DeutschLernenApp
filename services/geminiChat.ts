import { GoogleGenAI } from '@google/genai';
import { Message, Scenario } from '../types';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function sendMessageToGemini(
  history: Message[], 
  newMessage: string, 
  scenario: Scenario | null
): Promise<Message> {
  
  const systemInstruction = scenario ? scenario.systemInstruction : DEFAULT_SYSTEM_INSTRUCTION;

  // Filter history to minimal context to save tokens and keep relevance, 
  // map to Gemini format
  const geminiHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: geminiHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    const responseText = result.text || "Entschuldigung, ich habe das nicht verstanden.";

    return {
      id: Date.now().toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      id: Date.now().toString(),
      role: 'model',
      text: "Sorry, I'm having trouble connecting to the language server right now.",
      timestamp: new Date(),
    };
  }
}