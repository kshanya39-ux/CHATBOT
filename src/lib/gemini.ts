import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please configure it in the AI Studio Secrets panel.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const getChatSession = () => {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful, friendly, and concise AI assistant. You provide clear and accurate information.",
    },
  });
};
