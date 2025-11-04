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
 * @param imageBase64 - Base64 encoded image data
 * @param evaluationMode - If true, extracts content for evaluation (whiteboard drawings)
 */
export async function extractTextFromImage(
  imageBase64: string,
  evaluationMode: boolean = false
): Promise<string> {
  try {
    const url = `${API_BASE_URL}/extract-image`
    console.log('🌐 [vercelApiService] Calling extract-image API:', url)
    console.log('📊 [vercelApiService] Image base64 length:', imageBase64?.length || 0)
    console.log('🎯 [vercelApiService] Evaluation mode:', evaluationMode)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        evaluationMode,
      }),
    })

    console.log('📡 [vercelApiService] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [vercelApiService] Error response:', errorData)
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ [vercelApiService] Success, content length:', data.content?.length || 0)
    return data.content
  } catch (error: any) {
    console.error('❌ [vercelApiService] Vercel Vision API Error:', error)
    throw new Error(error.message || 'Failed to extract text from image')
  }
}

export default {
  sendMessage,
  extractTextFromImage,
}

