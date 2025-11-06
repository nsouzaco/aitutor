/**
 * Problem Generator - Select random problems from subtopic examples
 */

import { getSubtopicById } from '../data/curriculum'

/**
 * Generate a problem message for a given subtopic
 */
export function generateProblemForSubtopic(subtopicId: string): string | null {
  const subtopic = getSubtopicById(subtopicId)
  
  if (!subtopic || !subtopic.examples || subtopic.examples.length === 0) {
    return null
  }

  // Pick a random example from the subtopic
  const randomIndex = Math.floor(Math.random() * subtopic.examples.length)
  const problem = subtopic.examples[randomIndex]

  // Format the message
  return `Let's practice ${subtopic.name}! Solve the following problem:\n\n${problem}`
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

