import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

// Get Firebase config
const config = functions.config();

// Initialize OpenAI (API key from Firebase config)
const openai = new OpenAI({
  apiKey: config.openai?.key,
});

// Rate limiting: Store request counts per user
const requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

// Rate limit: 50 requests per hour per user
const RATE_LIMIT = 50;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if user has exceeded rate limit
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset counter
    requestCounts.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Send message to OpenAI GPT-4o
 */
export const sendMessage = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this service.'
    );
  }

  const userId = context.auth.uid;

  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    );
  }

  // Validate input
  const { messages, temperature = 0.7, maxTokens = 500 } = data;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Messages array is required and cannot be empty.'
    );
  }

  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return { content };
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many requests. Please try again in a moment.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get response from AI. Please try again.'
    );
  }
});

/**
 * Extract text from image using GPT-4o Vision
 */
export const extractTextFromImage = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this service.'
    );
  }

  const userId = context.auth.uid;

  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    );
  }

  // Validate input
  const { imageBase64 } = data;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image data is required.'
    );
  }

  try {
    // Ensure proper data URL format
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the math problem from this image. Return ONLY the problem text, preserving all mathematical notation. If the image contains handwritten or printed math, transcribe it accurately using standard notation (or LaTeX where appropriate). If unclear, indicate what needs clarification.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No text extracted from image');
    }

    return { content };
  } catch (error: any) {
    console.error('OpenAI Vision API error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many requests. Please try again in a moment.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to extract text from image. Please try again.'
    );
  }
});

