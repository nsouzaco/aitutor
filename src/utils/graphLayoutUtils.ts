/**
 * Graph Layout Utilities for React Flow
 * 
 * Converts curriculum data into React Flow nodes and edges
 * Provides auto-layout algorithms and styling based on mastery status
 */

import { Node, Edge, Position } from 'reactflow'
import { Subtopic, SubtopicStatus, Unit } from '../types/curriculum'
import { CURRICULUM, getAllSubtopics } from '../data/curriculum'
import { StudentProgress } from '../types/progress'

// Node dimensions for layout calculations
const NODE_WIDTH = 180
const NODE_HEIGHT = 80
const HORIZONTAL_SPACING = 250
const VERTICAL_SPACING = 120
const UNIT_VERTICAL_SPACING = 200

/**
 * Color scheme for node states
 */
export const NODE_COLORS = {
  mastered: {
    bg: '#10b981', // green-500
    border: '#059669', // green-600
    text: '#ffffff',
  },
  'in-progress': {
    bg: '#fbbf24', // yellow-400
    border: '#f59e0b', // yellow-500
    text: '#000000',
  },
  'not-started': {
    bg: '#ffffff',
    border: '#d1d5db', // gray-300
    text: '#374151', // gray-700
  },
  locked: {
    bg: '#f3f4f6', // gray-100
    border: '#9ca3af', // gray-400
    text: '#9ca3af', // gray-400
  },
}

/**
 * Get color for a subtopic status
 */
export function getNodeColor(status: SubtopicStatus): {
  bg: string
  border: string
  text: string
} {
  return NODE_COLORS[status]
}

/**
 * Convert curriculum to React Flow nodes and edges
 */
export function convertCurriculumToReactFlow(
  userProgress?: StudentProgress
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  const allSubtopics = getAllSubtopics()
  const masteredSubtopics = userProgress
    ? Object.keys(userProgress.subtopics).filter(
        id => userProgress.subtopics[id].mastered
      )
    : []

  // Calculate positions using hierarchical layout
  const positions = calculateHierarchicalLayout()

  // Create nodes for each subtopic
  allSubtopics.forEach((subtopic, index) => {
    const progress = userProgress?.subtopics[subtopic.id]
    
    let status: SubtopicStatus
    if (progress?.mastered) {
      status = 'mastered'
    } else if (progress) {
      status = 'in-progress'
    } else {
      // Check if unlocked
      const allPrereqsMet = subtopic.prerequisites.every(prereqId =>
        masteredSubtopics.includes(prereqId)
      )
      status = allPrereqsMet ? 'not-started' : 'locked'
    }

    const colors = getNodeColor(status)
    const position = positions[subtopic.id] || { x: 100, y: index * VERTICAL_SPACING }

    nodes.push({
      id: subtopic.id,
      type: 'default',
      position,
      data: {
        label: subtopic.name,
        subtopic,
        status,
        progress,
      },
      style: {
        background: colors.bg,
        color: colors.text,
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '10px',
        width: NODE_WIDTH,
        fontSize: '12px',
        fontWeight: 500,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })
  })

  // Create edges for prerequisites
  allSubtopics.forEach(subtopic => {
    subtopic.prerequisites.forEach(prereqId => {
      edges.push({
        id: `${prereqId}-${subtopic.id}`,
        source: prereqId,
        target: subtopic.id,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#9ca3af',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#9ca3af',
        },
      })
    })
  })

  return { nodes, edges }
}

/**
 * Calculate hierarchical layout positions for nodes
 * Organizes by difficulty level and prerequisite dependencies
 */
export function calculateHierarchicalLayout(): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const allSubtopics = getAllSubtopics()

  // Group by unit
  let currentUnitY = 0

  CURRICULUM.units.forEach((unit, unitIndex) => {
    // Collect all subtopics in this unit
    const unitSubtopics: Subtopic[] = []
    unit.topics.forEach(topic => {
      unitSubtopics.push(...topic.subtopics)
    })

    // Calculate depth (level) for each subtopic based on prerequisites
    const depths = calculateSubtopicDepths(unitSubtopics)
    const maxDepth = Math.max(...Object.values(depths))

    // Group by depth (column)
    const columns: Subtopic[][] = []
    for (let d = 0; d <= maxDepth; d++) {
      columns[d] = unitSubtopics.filter(sub => depths[sub.id] === d)
    }

    // Position nodes
    columns.forEach((column, colIndex) => {
      column.forEach((subtopic, rowIndex) => {
        const x = colIndex * HORIZONTAL_SPACING
        const y = currentUnitY + rowIndex * VERTICAL_SPACING

        positions[subtopic.id] = { x, y }
      })
    })

    // Update Y for next unit
    const maxRowsInUnit = Math.max(...columns.map(col => col.length))
    currentUnitY += maxRowsInUnit * VERTICAL_SPACING + UNIT_VERTICAL_SPACING
  })

  return positions
}

/**
 * Calculate depth (level) for each subtopic based on prerequisite chain
 * Depth 0 = no prerequisites, depth 1 = depends on depth 0, etc.
 */
function calculateSubtopicDepths(subtopics: Subtopic[]): Record<string, number> {
  const depths: Record<string, number> = {}
  const visited = new Set<string>()

  function calculateDepth(subtopic: Subtopic): number {
    if (depths[subtopic.id] !== undefined) {
      return depths[subtopic.id]
    }

    if (visited.has(subtopic.id)) {
      // Circular dependency - shouldn't happen, but handle gracefully
      return 0
    }

    visited.add(subtopic.id)

    if (subtopic.prerequisites.length === 0) {
      depths[subtopic.id] = 0
      return 0
    }

    // Depth is 1 + max depth of prerequisites
    const prereqDepths = subtopic.prerequisites
      .map(prereqId => {
        const prereq = subtopics.find(s => s.id === prereqId)
        return prereq ? calculateDepth(prereq) : 0
      })

    const depth = 1 + Math.max(...prereqDepths, 0)
    depths[subtopic.id] = depth
    return depth
  }

  subtopics.forEach(subtopic => calculateDepth(subtopic))
  return depths
}

/**
 * Build edges from prerequisites
 */
export function buildEdgesFromPrerequisites(subtopics: Subtopic[]): Edge[] {
  const edges: Edge[] = []

  subtopics.forEach(subtopic => {
    subtopic.prerequisites.forEach(prereqId => {
      edges.push({
        id: `${prereqId}-${subtopic.id}`,
        source: prereqId,
        target: subtopic.id,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#9ca3af',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#9ca3af',
        },
      })
    })
  })

  return edges
}

/**
 * Get status icon for display
 */
export function getStatusIcon(status: SubtopicStatus): string {
  switch (status) {
    case 'mastered':
      return '✓'
    case 'in-progress':
      return '◐'
    case 'locked':
      return '🔒'
    case 'not-started':
      return '○'
    default:
      return ''
  }
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: SubtopicStatus): string {
  switch (status) {
    case 'mastered':
      return 'Mastered'
    case 'in-progress':
      return 'In Progress'
    case 'locked':
      return 'Locked'
    case 'not-started':
      return 'Not Started'
    default:
      return ''
  }
}

/**
 * Calculate viewport bounds for auto-centering
 */
export function calculateViewportBounds(nodes: Node[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 }
  }

  const xs = nodes.map(n => n.position.x)
  const ys = nodes.map(n => n.position.y)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs) + NODE_WIDTH
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys) + NODE_HEIGHT

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  convertCurriculumToReactFlow,
  calculateHierarchicalLayout,
  buildEdgesFromPrerequisites,
  getNodeColor,
  getStatusIcon,
  getStatusLabel,
  calculateViewportBounds,
}

