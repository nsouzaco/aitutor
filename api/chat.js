/**
 * Vercel Serverless Function: OpenAI Chat API
 * This function securely calls OpenAI API with the API key stored in environment variables
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { messages, temperature = 0.7, maxTokens = 500 } = req.body;

    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array required' });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

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

    // Return successful response
    return res.status(200).json({ content });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait a moment and try again.' 
      });
    } else if (error?.status === 401) {
      return res.status(500).json({ 
        error: 'API configuration error' 
      });
    } else {
      return res.status(500).json({ 
        error: error.message || 'An error occurred while processing your request' 
      });
    }
  }
}

