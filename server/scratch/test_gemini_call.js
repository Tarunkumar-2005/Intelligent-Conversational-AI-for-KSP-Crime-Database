import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Sending test message to gemini-2.5-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say hello in Kannada.',
    });
    console.log('Gemini Response:', response.text);
  } catch (error) {
    console.error('Gemini Call Failed:', error);
  }
};

run();
