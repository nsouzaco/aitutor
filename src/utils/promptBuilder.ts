import { Message } from '../types'
import { ChatMessage } from '../services/openaiService'
import { SOCRATIC_SYSTEM_PROMPT } from '../constants'

/**
 * Build the conversation context for OpenAI API
 * Includes system prompt and recent conversation history
 * @param messages - Array of conversation messages
 * @param stuckCount - Number of times student has been stuck
 * @param isWhiteboardEvaluation - Whether the last message is a whiteboard evaluation
 * @param subtopicContext - Optional subtopic context (difficulty, topic name, etc.)
 */
export function buildConversationContext(
  messages: Message[],
  stuckCount: number = 0,
  isWhiteboardEvaluation: boolean = false,
  subtopicContext?: string | null
): ChatMessage[] {
  // Start with system prompt
  const systemPrompt = buildSystemPrompt(stuckCount, isWhiteboardEvaluation, subtopicContext)
  
  const contextMessages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ]

  // Add conversation history (last 20 messages to manage token usage)
  const recentMessages = messages.slice(-20)
  
  for (const message of recentMessages) {
    contextMessages.push({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.content,
    })
  }

  return contextMessages
}

/**
 * Build system prompt with hint level guidance based on stuck count
 * @param stuckCount - Number of times student has been stuck
 * @param isWhiteboardEvaluation - Whether this is a whiteboard evaluation (student sharing work)
 * @param subtopicContext - Optional subtopic context (difficulty, topic name, etc.)
 */
function buildSystemPrompt(
  stuckCount: number, 
  isWhiteboardEvaluation: boolean = false,
  subtopicContext?: string | null
): string {
  let hintGuidance = ''
  
  // Special guidance for whiteboard evaluations
  if (isWhiteboardEvaluation) {
    hintGuidance = `\n\nCRITICAL - STUDENT SHARING WORK:
When a student shares their work (drawing, equation, or solution steps):
- DO NOT give direct steps or solutions
- DO NOT list out "here are the steps to solve"
- Instead, ask ONE Socratic question about their work
- Examples: "What do you notice about this equation?" "What would happen if you tried...?" "What's the goal here?"
- Guide them to discover the next step themselves
- If their work is correct, celebrate and ask what they think comes next
- If their work has an error, ask a question that helps them see it
- NEVER say "Here are the steps: 1. Subtract 1, 2. Divide by 2" etc.
- The student is showing you their work - guide them with questions, don't solve it for them!`
  }

  if (stuckCount >= 3) {
    hintGuidance += `\n\nIMPORTANT: The student has been stuck for ${stuckCount} turns. Provide a MORE CONCRETE hint (Level 3-4). Give specific direction or show a similar worked example, but still don't solve it completely.`
  } else if (stuckCount >= 2) {
    hintGuidance += `\n\nNOTE: The student seems stuck (${stuckCount} uncertain responses). Provide a helpful hint (Level 2-3). Narrow down the options or give more specific guidance.`
  } else if (stuckCount === 1) {
    hintGuidance += `\n\nNOTE: The student may be uncertain. Consider providing a gentle hint if needed, but try a clarifying question first.`
  }

  // Add subtopic context if provided
  let subtopicGuidance = ''
  if (subtopicContext) {
    subtopicGuidance = `\n\n=== PRACTICE SESSION CONTEXT ===\n${subtopicContext}\n=== END CONTEXT ===`
  }

  return SOCRATIC_SYSTEM_PROMPT + subtopicGuidance + hintGuidance
}

/**
 * Detect if a student response indicates they're stuck
 */
export function detectStuckResponse(response: string): boolean {
  const lowerResponse = response.toLowerCase().trim()

  const stuckPhrases = [
    "i don't know",
    "don't know",
    'not sure',
    'no idea',
    'confused',
    "don't understand",
    "doesn't make sense",
    'help',
    'stuck',
    'idk',
    '???',
    '??',
  ]

  // Check if response is very short (might indicate uncertainty)
  if (lowerResponse.length < 3) {
    return true
  }

  // Check for stuck phrases
  return stuckPhrases.some(phrase => lowerResponse.includes(phrase))
}

/**
 * Detect if the conversation has reached a successful conclusion
 */
export function detectCelebration(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  const celebrationIndicators = [
    'correct',
    'exactly',
    'perfect',
    'well done',
    'great job',
    'excellent',
    'you solved it',
    'you got it',
    "that's right",
    'congratulations',
  ]

  return celebrationIndicators.some(indicator =>
    lowerMessage.includes(indicator)
  )
}

/**
 * Detect the type of math problem from the problem text
 */
export function detectProblemType(problemText: string): string {
  const lower = problemText.toLowerCase()

  // Linear equations
  if (/\d*x\s*[+\-]\s*\d+\s*=\s*\d+/.test(lower)) {
    return 'linear_equation'
  }

  // Quadratic equations
  if (/x[²2]\s*[+\-]|x\^2/.test(lower)) {
    return 'quadratic_equation'
  }

  // Word problems (looking for context words)
  if (
    /person|people|age|years|distance|speed|time|cost|price|total|each/.test(
      lower
    )
  ) {
    return 'word_problem'
  }

  // Geometry
  if (
    /area|perimeter|volume|radius|diameter|triangle|circle|rectangle|square|polygon/.test(
      lower
    )
  ) {
    return 'geometry'
  }

  // Systems of equations
  if (/and|,/.test(lower) && /x.*y|y.*x/.test(lower)) {
    return 'system_of_equations'
  }

  // Fractions
  if (/\d+\/\d+|fraction/.test(lower)) {
    return 'fractions'
  }

  return 'general'
}

