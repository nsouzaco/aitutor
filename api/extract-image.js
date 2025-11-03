/**
 * Vercel Serverless Function: OpenAI Vision API
 * This function securely calls OpenAI Vision API to extract text from images
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
    const { imageBase64 } = req.body;

    // Validate request body
    if (!imageBase64) {
      return res.status(400).json({ error: 'Invalid request: imageBase64 required' });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Prepare image URL format
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
              text: 'Extract the math problem from this image. Return ONLY the math equation or problem. Use LaTeX notation for all mathematical expressions (wrap equations in \\( \\) for inline math or \\[ \\] for display math). Transcribe handwritten or printed math accurately. If multiple equations, separate with line breaks.',
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

    let content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No text extracted from image');
    }

    // Convert LaTeX delimiters to our expected format
    // \(...\) -> $...$  (inline math)
    // \[...\] -> $$...$$ (block math)
    content = content.replace(/\\\((.*?)\\\)/g, '$$$1$$');
    content = content.replace(/\\\[(.*?)\\\]/g, '$$$$$$1$$$$');

    // Return successful response
    return res.status(200).json({ content });

  } catch (error) {
    console.error('OpenAI Vision API Error:', error);

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
        error: error.message || 'An error occurred while processing the image' 
      });
    }
  }
}

