import { GoogleGenAI } from '@google/genai';
import logger from './logger.js';

let aiInstance = null;

const getGeminiClient = () => {
  if (aiInstance) return aiInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY environment variable is not defined. Conversational modules will fail.');
    return null;
  }

  try {
    aiInstance = new GoogleGenAI({ apiKey });
    logger.info('Gemini AI Client initialized successfully.');
    return aiInstance;
  } catch (error) {
    logger.error(`Error initializing Gemini AI Client: ${error.message}`);
    return null;
  }
};

export default getGeminiClient;
