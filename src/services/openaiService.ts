import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY is not set in environment variables')
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true, // Note: For production, move API calls to backend
})

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
 * Send a message to OpenAI's GPT-4 API
 */
export async function sendMessage(
  options: SendMessageOptions
): Promise<string> {
  const { messages, temperature = 0.7, maxTokens = 500 } = options

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o is the latest model as of 2024
      messages,
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return content
  } catch (error: any) {
    throw handleOpenAIError(error)
  }
}

/**
 * Extract text from an image using GPT-4 Vision
 */
export async function extractTextFromImage(
  imageBase64: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o supports vision
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
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No text extracted from image')
    }

    return content
  } catch (error: any) {
    throw handleOpenAIError(error)
  }
}

/**
 * Handle OpenAI API errors and convert to user-friendly messages
 */
function handleOpenAIError(error: any): Error {
  const errorData: OpenAIError = {
    message: 'Something went wrong. Please try again.',
    type: 'unknown',
  }

  if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
    errorData.type = 'rate_limit'
    errorData.message =
      'Too many requests. Please wait a moment and try again.'
  } else if (error?.status === 401 || error?.code === 'invalid_api_key') {
    errorData.type = 'invalid_key'
    errorData.message = 'Configuration error. Please check your API key.'
  } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    errorData.type = 'network'
    errorData.message = 'Network error. Please check your internet connection.'
  } else if (error?.code === 'ETIMEDOUT') {
    errorData.type = 'timeout'
    errorData.message = 'Request timed out. Please try again.'
  } else if (error?.message) {
    errorData.message = error.message
  }

  const customError = new Error(errorData.message) as Error & {
    type: OpenAIError['type']
  }
  customError.type = errorData.type

  return customError
}

export default {
  sendMessage,
  extractTextFromImage,
}

