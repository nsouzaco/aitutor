/**
 * Placement Test - 20 questions to assess student level
 * Maps to Algebraic Thinking unit (foundation for all topics)
 */

export interface PlacementQuestion {
  id: string
  question: string
  answer: string
  subtopicId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  explanation: string
}

export const PLACEMENT_TEST_QUESTIONS: PlacementQuestion[] = [
  // Beginner (Level 1) - 5 questions
  {
    id: 'q1',
    question: 'Evaluate: 3x + 5 when x = 4',
    answer: '17',
    subtopicId: 'sub-variables',
    difficulty: 'beginner',
    explanation: 'Substitute x=4: 3(4) + 5 = 12 + 5 = 17',
  },
  {
    id: 'q2',
    question: 'Simplify: 2a + 3b + 4a - b',
    answer: '6a + 2b',
    subtopicId: 'sub-variables',
    difficulty: 'beginner',
    explanation: 'Combine like terms: (2a + 4a) + (3b - b) = 6a + 2b',
  },
  {
    id: 'q3',
    question: 'Solve: x + 7 = 12',
    answer: '5',
    subtopicId: 'sub-one-step',
    difficulty: 'beginner',
    explanation: 'Subtract 7 from both sides: x = 12 - 7 = 5',
  },
  {
    id: 'q4',
    question: 'Solve: 3y = 15',
    answer: '5',
    subtopicId: 'sub-one-step',
    difficulty: 'beginner',
    explanation: 'Divide both sides by 3: y = 15 ÷ 3 = 5',
  },
  {
    id: 'q5',
    question: 'What is the next number in the pattern: 2, 5, 8, 11, ...',
    answer: '14',
    subtopicId: 'sub-patterns',
    difficulty: 'beginner',
    explanation: 'Pattern: add 3 each time. 11 + 3 = 14',
  },

  // Intermediate (Level 2) - 5 questions
  {
    id: 'q6',
    question: 'Solve: 2x + 5 = 13',
    answer: '4',
    subtopicId: 'sub-two-step',
    difficulty: 'intermediate',
    explanation: 'Subtract 5: 2x = 8, then divide by 2: x = 4',
  },
  {
    id: 'q7',
    question: 'Solve: 4y - 3 = 17',
    answer: '5',
    subtopicId: 'sub-two-step',
    difficulty: 'intermediate',
    explanation: 'Add 3: 4y = 20, then divide by 4: y = 5',
  },
  {
    id: 'q8',
    question: 'If y = 2x + 3, what is y when x = 4?',
    answer: '11',
    subtopicId: 'sub-input-output',
    difficulty: 'intermediate',
    explanation: 'Substitute x=4: y = 2(4) + 3 = 8 + 3 = 11',
  },
  {
    id: 'q9',
    question: 'Solve: x + 5 > 8',
    answer: 'x > 3',
    subtopicId: 'sub-simple-inequality',
    difficulty: 'intermediate',
    explanation: 'Subtract 5 from both sides: x > 3',
  },
  {
    id: 'q10',
    question: 'Solve: 3y ≤ 15',
    answer: 'y ≤ 5',
    subtopicId: 'sub-simple-inequality',
    difficulty: 'intermediate',
    explanation: 'Divide both sides by 3: y ≤ 5',
  },

  // Advanced (Level 3) - 5 questions
  {
    id: 'q11',
    question: 'Solve: 3x + 7 = 2x + 12',
    answer: '5',
    subtopicId: 'sub-multi-step',
    difficulty: 'advanced',
    explanation: 'Subtract 2x from both sides: x + 7 = 12, then x = 5',
  },
  {
    id: 'q12',
    question: 'Solve: 5(y - 2) = 3y + 4',
    answer: '7',
    subtopicId: 'sub-multi-step',
    difficulty: 'advanced',
    explanation: 'Distribute: 5y - 10 = 3y + 4. Solve: 2y = 14, y = 7',
  },
  {
    id: 'q13',
    question: 'Solve: 3x + 5 ≥ 2x + 9',
    answer: 'x ≥ 4',
    subtopicId: 'sub-multi-inequality',
    difficulty: 'advanced',
    explanation: 'Subtract 2x: x + 5 ≥ 9, then subtract 5: x ≥ 4',
  },
  {
    id: 'q14',
    question: 'What is the slope of the line through (2,3) and (5,9)?',
    answer: '2',
    subtopicId: 'sub-linear-functions',
    difficulty: 'advanced',
    explanation: 'Slope = (9-3)/(5-2) = 6/3 = 2',
  },
  {
    id: 'q15',
    question: 'If 3/5 = x/20, what is x?',
    answer: '12',
    subtopicId: 'sub-ratio',
    difficulty: 'advanced',
    explanation: 'Cross multiply: 5x = 60, so x = 12',
  },

  // Mixed Review - 5 questions
  {
    id: 'q16',
    question: 'A shirt costs $40. With 20% off, what is the sale price?',
    answer: '32',
    subtopicId: 'sub-percent',
    difficulty: 'intermediate',
    explanation: '20% of 40 = 8, so sale price = 40 - 8 = $32',
  },
  {
    id: 'q17',
    question: 'John has twice as many apples as Sarah. Together they have 15. How many does John have?',
    answer: '10',
    subtopicId: 'sub-word-problems',
    difficulty: 'advanced',
    explanation: 'If Sarah has x, John has 2x. x + 2x = 15, so 3x = 15, x = 5. John has 10',
  },
  {
    id: 'q18',
    question: 'What is the pattern rule for: Input 1→3, 2→5, 3→7, 4→9',
    answer: '2x + 1',
    subtopicId: 'sub-input-output',
    difficulty: 'intermediate',
    explanation: 'Each output is 2 times input plus 1: y = 2x + 1',
  },
  {
    id: 'q19',
    question: 'Solve: 2(3x - 4) + 5 = 4x + 1',
    answer: '3',
    subtopicId: 'sub-multi-step',
    difficulty: 'advanced',
    explanation: 'Distribute: 6x - 8 + 5 = 4x + 1. Simplify: 6x - 3 = 4x + 1. Solve: 2x = 4, x = 2',
  },
  {
    id: 'q20',
    question: 'A car travels 240 miles in 4 hours. What is its speed in mph?',
    answer: '60',
    subtopicId: 'sub-rate',
    difficulty: 'intermediate',
    explanation: 'Speed = distance/time = 240/4 = 60 mph',
  },
]

/**
 * Determine student level based on placement test results
 */
export function calculatePlacementResults(answers: Record<string, string>): {
  score: number
  level: 'beginner' | 'intermediate' | 'advanced'
  masteredSubtopics: string[]
  recommendedStartingSubtopic: string
} {
  let correct = 0
  let beginnerCorrect = 0
  let intermediateCorrect = 0
  let advancedCorrect = 0
  const masteredSubtopics = new Set<string>()

  // Count by difficulty
  PLACEMENT_TEST_QUESTIONS.forEach((question) => {
    const userAnswer = answers[question.id]?.trim().toLowerCase()
    const correctAnswer = question.answer.toLowerCase()

    if (userAnswer && (userAnswer === correctAnswer || 
        userAnswer.replace(/\s+/g, '') === correctAnswer.replace(/\s+/g, ''))) {
      correct++
      masteredSubtopics.add(question.subtopicId)

      if (question.difficulty === 'beginner') beginnerCorrect++
      if (question.difficulty === 'intermediate') intermediateCorrect++
      if (question.difficulty === 'advanced') advancedCorrect++
    }
  })

  const score = Math.round((correct / PLACEMENT_TEST_QUESTIONS.length) * 100)

  // Determine level
  let level: 'beginner' | 'intermediate' | 'advanced'
  let recommendedStartingSubtopic: string

  if (advancedCorrect >= 3) {
    level = 'advanced'
    recommendedStartingSubtopic = 'sub-multi-step' // Start with multi-step equations
  } else if (intermediateCorrect >= 3) {
    level = 'intermediate'
    recommendedStartingSubtopic = 'sub-two-step' // Start with two-step equations
  } else {
    level = 'beginner'
    recommendedStartingSubtopic = 'sub-variables' // Start at the beginning
  }

  return {
    score,
    level,
    masteredSubtopics: Array.from(masteredSubtopics),
    recommendedStartingSubtopic,
  }
}

