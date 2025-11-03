/**
 * Vercel API Service
 * Calls the Vercel serverless functions instead of OpenAI directly
 * This keeps the API key secure on the server
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface SendMessageOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

// Get API base URL from environment or use relative path for same domain
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Send a message to the Vercel chat API endpoint
 */
export async function sendMessage(options: SendMessageOptions): Promise<string> {
  const { messages, temperature = 0.7, maxTokens = 500 } = options

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        temperature,
        maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content
  } catch (error: any) {
    console.error('Vercel API Error:', error)
    throw new Error(error.message || 'Failed to get response from server')
  }
}

/**
 * Extract text from an image using the Vercel Vision API endpoint
 */
export async function extractTextFromImage(imageBase64: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/extract-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content
  } catch (error: any) {
    console.error('Vercel Vision API Error:', error)
    throw new Error(error.message || 'Failed to extract text from image')
  }
}

export default {
  sendMessage,
  extractTextFromImage,
}

