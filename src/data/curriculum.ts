/**
 * Curriculum Data - Complete 8th Grade Math Curriculum
 * 
 * Organized as: Units → Topics → Subtopics
 * Each subtopic has prerequisites, difficulty level, and example problems
 * 
 * Total: 4 units, 28 subtopics
 */

import { Curriculum, Unit, Topic, Subtopic } from '../types/curriculum'

// ============================================================================
// UNIT 1: ALGEBRAIC THINKING
// ============================================================================

const algebraicThinkingUnit: Unit = {
  id: 'unit-algebraic',
  name: 'Algebraic Thinking',
  description: 'Foundation of algebra: variables, equations, functions, and relationships',
  topics: [
    {
      id: 'topic-expressions',
      name: 'Variables & Expressions',
      description: 'Understanding variables and algebraic expressions',
      subtopics: [
        {
          id: 'sub-variables',
          name: 'Variables & Expressions',
          description: 'Evaluate expressions with variables, combine like terms',
          difficulty: 1,
          prerequisites: [],
          estimatedMinutes: 30,
          examples: [
            'Evaluate 3x + 5 when x = 4',
            'Simplify: 2a + 3b + 4a - b',
            'Write an expression for "5 more than twice a number"',
          ],
        },
      ],
    },
    {
      id: 'topic-equations',
      name: 'Solving Equations',
      description: 'Linear equations from simple to complex',
      subtopics: [
        {
          id: 'sub-one-step',
          name: 'One-Step Equations',
          description: 'Solve equations using a single operation',
          difficulty: 1,
          prerequisites: ['sub-variables'],
          estimatedMinutes: 30,
          examples: [
            'Solve: x + 7 = 12',
            'Solve: 3y = 15',
            'Solve: n - 8 = 3',
          ],
        },
        {
          id: 'sub-two-step',
          name: 'Two-Step Equations',
          description: 'Solve equations requiring two operations',
          difficulty: 2,
          prerequisites: ['sub-one-step'],
          estimatedMinutes: 45,
          examples: [
            'Solve: 2x + 5 = 13',
            'Solve: 4y - 3 = 17',
            'Solve: (x/3) + 2 = 8',
          ],
        },
        {
          id: 'sub-multi-step',
          name: 'Multi-Step Equations',
          description: 'Solve complex equations with variables on both sides',
          difficulty: 2,
          prerequisites: ['sub-two-step'],
          estimatedMinutes: 60,
          examples: [
            'Solve: 3x + 7 = 2x + 12',
            'Solve: 5(y - 2) = 3y + 4',
            'Solve: 2(3x - 4) + 5 = 4x + 1',
          ],
        },
      ],
    },
    {
      id: 'topic-patterns',
      name: 'Patterns & Functions',
      description: 'Recognize patterns and understand functions',
      subtopics: [
        {
          id: 'sub-patterns',
          name: 'Patterns & Relationships',
          description: 'Identify and extend numerical and visual patterns',
          difficulty: 1,
          prerequisites: [],
          estimatedMinutes: 30,
          examples: [
            'Find the next term: 2, 5, 8, 11, ...',
            'What is the pattern rule for: 3, 6, 12, 24?',
            'Complete the table showing doubling',
          ],
        },
        {
          id: 'sub-input-output',
          name: 'Input/Output Tables',
          description: 'Complete function tables and find rules',
          difficulty: 2,
          prerequisites: ['sub-patterns'],
          estimatedMinutes: 45,
          examples: [
            'Complete the table for rule: y = 2x + 3',
            'Find the rule for the given input/output pairs',
            'Graph the relationship from a function table',
          ],
        },
        {
          id: 'sub-linear-functions',
          name: 'Linear Functions',
          description: 'Understand slope, y-intercept, and linear relationships',
          difficulty: 3,
          prerequisites: ['sub-input-output', 'sub-multi-step'],
          estimatedMinutes: 60,
          examples: [
            'Find the slope of the line through (2,3) and (5,9)',
            'Write equation in slope-intercept form: y = mx + b',
            'Graph y = 2x - 3',
          ],
        },
      ],
    },
    {
      id: 'topic-inequalities',
      name: 'Inequalities',
      description: 'Solve and graph inequalities',
      subtopics: [
        {
          id: 'sub-simple-inequality',
          name: 'Simple Inequalities',
          description: 'Solve and graph one and two-step inequalities',
          difficulty: 2,
          prerequisites: ['sub-two-step'],
          estimatedMinutes: 45,
          examples: [
            'Solve and graph: x + 5 > 8',
            'Solve: 3y ≤ 15',
            'Solve: 2x - 3 < 7',
          ],
        },
        {
          id: 'sub-multi-inequality',
          name: 'Multi-Step Inequalities',
          description: 'Solve complex inequalities with multiple operations',
          difficulty: 3,
          prerequisites: ['sub-simple-inequality', 'sub-multi-step'],
          estimatedMinutes: 60,
          examples: [
            'Solve: 3x + 5 ≥ 2x + 9',
            'Solve: 4(y - 2) < 3y + 5',
            'Solve and graph: -2(3x + 1) > 10',
          ],
        },
      ],
    },
  ],
}

// ============================================================================
// UNIT 2: GEOMETRY
// ============================================================================

const geometryUnit: Unit = {
  id: 'unit-geometry',
  name: 'Geometry',
  description: 'Angles, shapes, area, perimeter, and volume',
  topics: [
    {
      id: 'topic-angles',
      name: 'Angles & Lines',
      description: 'Understanding angles, lines, and their relationships',
      subtopics: [
        {
          id: 'sub-angles',
          name: 'Angles & Lines',
          description: 'Classify angles, find angle measures, parallel lines',
          difficulty: 1,
          prerequisites: [],
          estimatedMinutes: 30,
          examples: [
            'Find the complement of a 35° angle',
            'Find the supplement of a 110° angle',
            'If two angles are vertical angles, one measures 75°. Find the other.',
          ],
        },
      ],
    },
    {
      id: 'topic-polygons',
      name: 'Polygons',
      description: 'Properties of triangles and quadrilaterals',
      subtopics: [
        {
          id: 'sub-triangles',
          name: 'Triangles',
          description: 'Triangle properties, angle sum, types of triangles',
          difficulty: 2,
          prerequisites: ['sub-angles'],
          estimatedMinutes: 45,
          examples: [
            'Find the missing angle in a triangle with angles 60° and 80°',
            'Classify triangle with sides 5, 5, 8',
            'Find the perimeter of a triangle with sides 3, 4, 5',
          ],
        },
        {
          id: 'sub-quadrilaterals',
          name: 'Quadrilaterals',
          description: 'Properties of rectangles, squares, parallelograms, trapezoids',
          difficulty: 2,
          prerequisites: ['sub-angles'],
          estimatedMinutes: 45,
          examples: [
            'Find the perimeter of a rectangle with length 8 and width 5',
            'What is the sum of angles in any quadrilateral?',
            'Identify the shape: 4 equal sides and 4 right angles',
          ],
        },
      ],
    },
    {
      id: 'topic-measurement',
      name: 'Measurement',
      description: 'Calculate area, perimeter, and volume',
      subtopics: [
        {
          id: 'sub-area-perimeter',
          name: 'Area & Perimeter',
          description: 'Calculate area and perimeter of 2D shapes',
          difficulty: 2,
          prerequisites: ['sub-triangles', 'sub-quadrilaterals'],
          estimatedMinutes: 45,
          examples: [
            'Find the area of a rectangle: length 8, width 5',
            'Find the area of a triangle: base 6, height 4',
            'A circle has radius 3. Find its area (π ≈ 3.14)',
          ],
        },
        {
          id: 'sub-volume',
          name: 'Volume',
          description: 'Calculate volume of 3D shapes',
          difficulty: 3,
          prerequisites: ['sub-area-perimeter'],
          estimatedMinutes: 60,
          examples: [
            'Find volume of rectangular prism: 4 × 5 × 6',
            'Find volume of cylinder: radius 3, height 10',
            'Find volume of cube with side length 5',
          ],
        },
        {
          id: 'sub-pythagorean',
          name: 'Pythagorean Theorem',
          description: 'Apply a² + b² = c² to find side lengths',
          difficulty: 3,
          prerequisites: ['sub-triangles'],
          estimatedMinutes: 60,
          examples: [
            'Find the hypotenuse: a = 3, b = 4',
            'Find leg b: a = 5, c = 13',
            'Is a triangle with sides 7, 24, 25 a right triangle?',
          ],
        },
      ],
    },
  ],
}

// ============================================================================
// UNIT 3: DATA & STATISTICS
// ============================================================================

const dataStatisticsUnit: Unit = {
  id: 'unit-data',
  name: 'Data & Statistics',
  description: 'Analyzing data, statistics, and probability',
  topics: [
    {
      id: 'topic-statistics',
      name: 'Statistics',
      description: 'Measures of center and spread',
      subtopics: [
        {
          id: 'sub-mean-median',
          name: 'Mean, Median, Mode',
          description: 'Calculate and interpret measures of center',
          difficulty: 1,
          prerequisites: [],
          estimatedMinutes: 30,
          examples: [
            'Find the mean of: 5, 8, 12, 15, 20',
            'Find the median of: 3, 7, 9, 12, 15',
            'Find the mode of: 2, 3, 3, 5, 7, 3, 9',
          ],
        },
        {
          id: 'sub-range-outliers',
          name: 'Range & Outliers',
          description: 'Calculate range and identify outliers',
          difficulty: 1,
          prerequisites: [],
          estimatedMinutes: 30,
          examples: [
            'Find the range of: 12, 18, 22, 15, 30, 19',
            'Identify outliers in: 5, 7, 8, 6, 45, 7, 9',
            'How would removing the outlier affect the mean?',
          ],
        },
        {
          id: 'sub-data-viz',
          name: 'Data Visualization',
          description: 'Create and interpret graphs (bar, line, circle)',
          difficulty: 2,
          prerequisites: ['sub-mean-median'],
          estimatedMinutes: 45,
          examples: [
            'Create a bar graph from the given data',
            'Interpret the line graph showing temperature over time',
            'What percentage does each sector represent in this circle graph?',
          ],
        },
      ],
    },
    {
      id: 'topic-probability',
      name: 'Probability',
      description: 'Basic probability concepts',
      subtopics: [
        {
          id: 'sub-probability',
          name: 'Probability Basics',
          description: 'Calculate simple probabilities',
          difficulty: 2,
          prerequisites: [],
          estimatedMinutes: 45,
          examples: [
            'What is the probability of rolling a 4 on a die?',
            'A bag has 3 red and 7 blue marbles. P(red) = ?',
            'What is the probability of flipping heads on a fair coin?',
          ],
        },
        {
          id: 'sub-sample-space',
          name: 'Sample Space',
          description: 'List outcomes and calculate compound probabilities',
          difficulty: 2,
          prerequisites: ['sub-probability'],
          estimatedMinutes: 45,
          examples: [
            'List all outcomes for flipping 2 coins',
            'What is P(sum of 7) when rolling two dice?',
            'Tree diagram: toss coin then roll die',
          ],
        },
      ],
    },
  ],
}

// ============================================================================
// UNIT 4: PROBLEM SOLVING
// ============================================================================

const problemSolvingUnit: Unit = {
  id: 'unit-problem-solving',
  name: 'Problem Solving',
  description: 'Real-world applications with ratios, percents, and rates',
  topics: [
    {
      id: 'topic-ratios',
      name: 'Ratios & Proportions',
      description: 'Understand and apply ratios',
      subtopics: [
        {
          id: 'sub-ratio',
          name: 'Ratio & Proportion',
          description: 'Set up and solve proportions',
          difficulty: 2,
          prerequisites: ['sub-one-step'],
          estimatedMinutes: 45,
          examples: [
            'Solve the proportion: 3/5 = x/20',
            'If 2 apples cost $3, how much do 6 apples cost?',
            'Express ratio 12:18 in simplest form',
          ],
        },
        {
          id: 'sub-percent',
          name: 'Percent Problems',
          description: 'Calculate percents, percent increase/decrease',
          difficulty: 2,
          prerequisites: ['sub-ratio'],
          estimatedMinutes: 45,
          examples: [
            'What is 25% of 80?',
            'A shirt costs $40. With 20% off, what is the sale price?',
            'If a value increases from 50 to 65, what is the percent increase?',
          ],
        },
        {
          id: 'sub-rate',
          name: 'Rate Problems',
          description: 'Calculate unit rates, speed, distance, time',
          difficulty: 2,
          prerequisites: ['sub-ratio'],
          estimatedMinutes: 45,
          examples: [
            'A car travels 240 miles in 4 hours. What is its speed?',
            'Unit price: $12 for 3 pounds vs $18 for 5 pounds',
            'If speed is 60 mph, how far in 2.5 hours?',
          ],
        },
      ],
    },
    {
      id: 'topic-word-problems',
      name: 'Multi-Step Word Problems',
      description: 'Complex real-world problems',
      subtopics: [
        {
          id: 'sub-word-problems',
          name: 'Multi-Step Word Problems',
          description: 'Solve problems requiring multiple operations and concepts',
          difficulty: 3,
          prerequisites: ['sub-multi-step', 'sub-percent', 'sub-rate'],
          estimatedMinutes: 60,
          examples: [
            'A store marks up items 40% then offers 25% off. Final price of $50 item?',
            'Two trains leave at same time, speeds 60 mph and 80 mph. When are they 420 miles apart?',
            'John has $500. He spends 30%, then 20% of what remains. How much left?',
          ],
        },
      ],
    },
  ],
}

// ============================================================================
// FULL CURRICULUM
// ============================================================================

export const CURRICULUM: Curriculum = {
  units: [
    algebraicThinkingUnit,
    geometryUnit,
    dataStatisticsUnit,
    problemSolvingUnit,
  ],
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all subtopics across all units
 */
export function getAllSubtopics(): Subtopic[] {
  const subtopics: Subtopic[] = []
  CURRICULUM.units.forEach(unit => {
    unit.topics.forEach(topic => {
      subtopics.push(...topic.subtopics)
    })
  })
  return subtopics
}

/**
 * Get a subtopic by ID
 */
export function getSubtopicById(subtopicId: string): Subtopic | undefined {
  return getAllSubtopics().find(sub => sub.id === subtopicId)
}

/**
 * Get all prerequisite subtopics for a given subtopic (full chain)
 */
export function getPrerequisiteChain(subtopicId: string): Subtopic[] {
  const subtopic = getSubtopicById(subtopicId)
  if (!subtopic) return []

  const chain: Subtopic[] = []
  const visited = new Set<string>()

  function traverse(id: string) {
    if (visited.has(id)) return // Prevent circular deps
    visited.add(id)

    const sub = getSubtopicById(id)
    if (!sub) return

    sub.prerequisites.forEach(prereqId => {
      traverse(prereqId)
      const prereq = getSubtopicById(prereqId)
      if (prereq && !chain.find(s => s.id === prereqId)) {
        chain.push(prereq)
      }
    })
  }

  traverse(subtopicId)
  return chain
}

/**
 * Validate curriculum has no circular dependencies
 */
export function validateCurriculum(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const subtopics = getAllSubtopics()

  subtopics.forEach(subtopic => {
    const visited = new Set<string>()
    
    function checkCircular(id: string, path: string[]): boolean {
      if (path.includes(id)) {
        errors.push(`Circular dependency detected: ${path.join(' → ')} → ${id}`)
        return true
      }

      const sub = getSubtopicById(id)
      if (!sub) {
        errors.push(`Invalid prerequisite reference: ${id}`)
        return false
      }

      return sub.prerequisites.some(prereqId => 
        checkCircular(prereqId, [...path, id])
      )
    }

    checkCircular(subtopic.id, [])
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Get subtopic name for display
 */
export function getSubtopicName(subtopicId: string): string {
  const subtopic = getSubtopicById(subtopicId)
  return subtopic?.name || 'Unknown Topic'
}

/**
 * Get unit and topic for a subtopic (for breadcrumb navigation)
 */
export function getSubtopicContext(subtopicId: string): {
  unit?: Unit
  topic?: Topic
  subtopic?: Subtopic
} {
  for (const unit of CURRICULUM.units) {
    for (const topic of unit.topics) {
      const subtopic = topic.subtopics.find(s => s.id === subtopicId)
      if (subtopic) {
        return { unit, topic, subtopic }
      }
    }
  }
  return {}
}

