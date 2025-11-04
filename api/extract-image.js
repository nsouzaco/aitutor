/**
 * Vercel Serverless Function: OpenAI Vision API
 * This function securely calls OpenAI Vision API to extract text from images
 */

import OpenAI from 'openai';

export default async function handler(req, res) {
  console.log('🔵 [extract-image] Function invoked');
  console.log('🔵 [extract-image] Method:', req.method);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ [extract-image] Invalid method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('🔵 [extract-image] API Key present:', !!apiKey);
  console.log('🔵 [extract-image] API Key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.error('❌ [extract-image] OPENAI_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { imageBase64, evaluationMode } = req.body;
    console.log('🔵 [extract-image] Request body received');
    console.log('🔵 [extract-image] Image base64 length:', imageBase64?.length || 0);
    console.log('🔵 [extract-image] Evaluation mode:', evaluationMode);

    // Validate request body
    if (!imageBase64) {
      console.log('❌ [extract-image] No imageBase64 provided');
      return res.status(400).json({ error: 'Invalid request: imageBase64 required' });
    }

    // Initialize OpenAI client
    console.log('🔵 [extract-image] Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });

    // Prepare image URL format
    const imageUrl = imageBase64.startsWith('data:') 
      ? imageBase64 
      : `data:image/jpeg;base64,${imageBase64}`;

    // Different prompts for evaluation mode (whiteboard) vs extraction mode (uploaded images)
    const promptText = evaluationMode
      ? 'Extract and transcribe ONLY the mathematical content from this whiteboard image. Return just the equations, expressions, or work shown - nothing else. Use LaTeX notation: $ for inline math (like $x^2$) and $$ for block/display math (like $$\\frac{a}{b}$$). If there are multiple steps or equations, list them in order with line breaks. Do not add any analysis, commentary, or explanations - just the mathematical content itself.'
      : 'Extract the math problem from this image. Return ONLY the math equation or problem. Use LaTeX notation for all mathematical expressions. Use $ for inline math (like $x^2$) and $$ for block/display math (like $$\\frac{a}{b}$$). Transcribe handwritten or printed math accurately. If multiple equations, separate with line breaks.';

    // Call OpenAI Vision API
    console.log('🔵 [extract-image] Calling OpenAI Vision API...');
    console.log('🔵 [extract-image] Model: gpt-4o');
    console.log('🔵 [extract-image] Max tokens:', evaluationMode ? 500 : 300);
    
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
      max_tokens: evaluationMode ? 200 : 300,
    });

    console.log('✅ [extract-image] OpenAI API call successful');
    console.log('🔵 [extract-image] Response choices:', response.choices?.length || 0);

    let content = response.choices[0]?.message?.content;

    if (!content) {
      console.log('❌ [extract-image] No content in response');
      throw new Error('No text extracted from image');
    }
    
    console.log('🔵 [extract-image] Content length:', content.length);

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
    console.log('✅ [extract-image] Returning success response');
    return res.status(200).json({ content });

  } catch (error) {
    console.error('❌ [extract-image] Error occurred:', error);
    console.error('❌ [extract-image] Error name:', error?.name);
    console.error('❌ [extract-image] Error message:', error?.message);
    console.error('❌ [extract-image] Error status:', error?.status);
    console.error('❌ [extract-image] Error stack:', error?.stack);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      console.log('⚠️ [extract-image] Rate limit error');
      return res.status(429).json({ 
        error: 'Too many requests. Please wait a moment and try again.' 
      });
    } else if (error?.status === 401) {
      console.log('⚠️ [extract-image] Authentication error');
      return res.status(500).json({ 
        error: 'API configuration error' 
      });
    } else {
      console.log('⚠️ [extract-image] Generic error, returning 500');
      return res.status(500).json({ 
        error: error.message || 'An error occurred while processing the image' 
      });
    }
  }
}

