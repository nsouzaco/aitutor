import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebaseService';

const functions = getFunctions(app);

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface SendMessageOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export interface OpenAIError {
  message: string
  type: 'rate_limit' | 'invalid_key' | 'network' | 'timeout' | 'unknown'
}

/**
 * Send a message to OpenAI's GPT-4 API via Cloud Functions
 */
export async function sendMessage(
  options: SendMessageOptions
): Promise<string> {
  const { messages, temperature = 0.7, maxTokens = 500 } = options

  try {
    const sendMessageFn = httpsCallable(functions, 'sendMessage');
    const result = await sendMessageFn({
      messages,
      temperature,
      maxTokens,
    });

    const data = result.data as { content: string };
    return data.content;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
}

/**
 * Extract text from an image using GPT-4 Vision via Cloud Functions
 */
export async function extractTextFromImage(
  imageBase64: string
): Promise<string> {
  try {
    const extractTextFn = httpsCallable(functions, 'extractTextFromImage');
    const result = await extractTextFn({
      imageBase64,
    });

    const data = result.data as { content: string };
    return data.content;
  } catch (error: any) {
    throw handleFirebaseError(error);
  }
}

/**
 * Handle Firebase Functions errors and convert to user-friendly messages
 */
function handleFirebaseError(error: any): Error {
  const errorData: OpenAIError = {
    message: 'Something went wrong. Please try again.',
    type: 'unknown',
  };

  // Handle Firebase Functions errors
  if (error.code === 'functions/unauthenticated') {
    errorData.type = 'invalid_key';
    errorData.message = 'You must be logged in to use this service.';
  } else if (error.code === 'functions/resource-exhausted') {
    errorData.type = 'rate_limit';
    errorData.message = 'Rate limit exceeded. Please try again later.';
  } else if (error.code === 'functions/invalid-argument') {
    errorData.message = 'Invalid request. Please try again.';
  } else if (error.code === 'functions/internal') {
    errorData.message = error.message || 'An error occurred. Please try again.';
  } else if (error.code === 'functions/unavailable') {
    errorData.type = 'network';
    errorData.message = 'Service temporarily unavailable. Please try again.';
  } else if (error.message) {
    errorData.message = error.message;
  }

  const customError = new Error(errorData.message) as Error & {
    type: OpenAIError['type']
  };
  customError.type = errorData.type;

  return customError;
}

export default {
  sendMessage,
  extractTextFromImage,
};

