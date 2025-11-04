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
    const { imageBase64, evaluationMode } = req.body;

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

    // Different prompts for evaluation mode (whiteboard) vs extraction mode (uploaded images)
    const promptText = evaluationMode
      ? 'Analyze this student\'s work on the whiteboard. Describe what you see: any mathematical equations, diagrams, problem-solving steps, or work shown. Use LaTeX notation for all mathematical expressions. Use $ for inline math (like $x^2$) and $$ for block/display math (like $$\\frac{a}{b}$$). Be detailed about what the student has drawn or written, including any partial solutions or work shown.'
      : 'Extract the math problem from this image. Return ONLY the math equation or problem. Use LaTeX notation for all mathematical expressions. Use $ for inline math (like $x^2$) and $$ for block/display math (like $$\\frac{a}{b}$$). Transcribe handwritten or printed math accurately. If multiple equations, separate with line breaks.';

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText,
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
      max_tokens: evaluationMode ? 500 : 300,
    });

    let content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No text extracted from image');
    }

    // Convert LaTeX delimiters to our expected format
    // \(...\) -> $...$  (inline math)
    // \[...\] -> $$...$$ (block math)
    // Handle both escaped and unescaped delimiters
    // Use replacement function to avoid $1 being interpreted as replacement group
    content = content.replace(/\\\((.*?)\\\)/g, (match, p1) => `$${p1}$`);
    content = content.replace(/\\\[(.*?)\\\]/g, (match, p1) => `$$${p1}$$`);
    
    // If API returns $...$ format directly, preserve it (no conversion needed)
    // The MathContent component will handle $...$ format correctly
    
    // Clean up any double-wrapping issues
    // Fix patterns like $ $x$ $ (should be just $x$)
    content = content.replace(/\$\s+\$([^$]+)\$\s+\$/g, '$$$1$');
    // Fix patterns like $$...$$$ (should be just $$...$$)
    content = content.replace(/\$\$\$+/g, '$$');

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

