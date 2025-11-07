/**
 * Problem Generator - Select random problems from subtopic examples
 */

import { getSubtopicById } from '../data/curriculum'

/**
 * Get difficulty level label
 */
function getDifficultyLabel(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1:
      return 'Beginner'
    case 2:
      return 'Intermediate'
    case 3:
      return 'Advanced'
  }
}

/**
 * Generate a problem message for a given subtopic with difficulty context
 */
export function generateProblemForSubtopic(subtopicId: string): string | null {
  const subtopic = getSubtopicById(subtopicId)
  
  if (!subtopic || !subtopic.examples || subtopic.examples.length === 0) {
    return null
  }

  // Pick a random example from the subtopic
  const randomIndex = Math.floor(Math.random() * subtopic.examples.length)
  const problem = subtopic.examples[randomIndex]
  
  const difficultyLabel = getDifficultyLabel(subtopic.difficulty)

  // Format the message with difficulty context
  return `Let's practice ${subtopic.name}! This is a ${difficultyLabel}-level problem. Solve the following:\n\n${problem}`
}

/**
 * Get subtopic context for AI prompt
 */
export function getSubtopicContext(subtopicId: string): string | null {
  const subtopic = getSubtopicById(subtopicId)
  
  if (!subtopic) {
    return null
  }
  
  const difficultyLabel = getDifficultyLabel(subtopic.difficulty)
  
  return `
CURRENT TOPIC: ${subtopic.name}
DIFFICULTY LEVEL: ${difficultyLabel}
DESCRIPTION: ${subtopic.description}

Adjust your teaching style based on the difficulty:
- Beginner: Use simpler language, more encouragement, smaller steps, celebrate every correct move
- Intermediate: Assume basic concepts are known, guide with questions, build confidence for multi-step thinking
- Advanced: Challenge their reasoning, connect to other concepts, encourage deeper problem-solving strategies

Keep your questions and guidance appropriate for a ${difficultyLabel}-level student working on ${subtopic.name}.
`.trim()
}

/**
 * Get a problem intro message for a subtopic
 */
export function getProblemIntro(subtopicId: string): string {
  const subtopic = getSubtopicById(subtopicId)
  
  if (!subtopic) {
    return "Let's solve a problem together!"
  }

  const intros = [
    `Let's practice ${subtopic.name}!`,
    `Time to work on ${subtopic.name}!`,
    `Ready to practice ${subtopic.name}?`,
    `Let's solve a ${subtopic.name} problem!`,
  ]

  const randomIntro = intros[Math.floor(Math.random() * intros.length)]
  return randomIntro
}


