/**
 * Graph Layout Utilities for React Flow
 * 
 * Converts curriculum data into React Flow nodes and edges
 * Provides auto-layout algorithms and styling based on mastery status
 */

import { Node, Edge, Position, MarkerType } from 'reactflow'
import { Subtopic, SubtopicStatus } from '../types/curriculum'
import { CURRICULUM, getAllSubtopics } from '../data/curriculum'
import { StudentProgress } from '../types/progress'

// Node dimensions for layout calculations
const NODE_WIDTH = 220
const NODE_HEIGHT = 100
const HORIZONTAL_SPACING = 320 // Space between prerequisite levels
const VERTICAL_SPACING = 130 // Space between nodes vertically
const UNIT_VERTICAL_SPACING = 80

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
  console.log('🎨 [GraphLayout] Converting curriculum to React Flow')
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  const allSubtopics = getAllSubtopics()
  console.log('📚 [GraphLayout] Total subtopics:', allSubtopics.length)
  const masteredSubtopics = userProgress
    ? Object.keys(userProgress.subtopics).filter(
        id => userProgress.subtopics[id].mastered
      )
    : []
  console.log('✅ [GraphLayout] Mastered subtopics:', masteredSubtopics.length)

  // Calculate positions using hierarchical layout
  const positions = calculateHierarchicalLayout()
  console.log('📍 [GraphLayout] Calculated positions for', Object.keys(positions).length, 'nodes')

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
        border: `3px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        width: NODE_WIDTH,
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
          stroke: '#6b7280',
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6b7280',
          width: 20,
          height: 20,
        },
      })
    })
  })

  console.log('🎨 [GraphLayout] Created', nodes.length, 'nodes and', edges.length, 'edges')
  return { nodes, edges }
}

/**
 * Calculate hierarchical layout positions for nodes
 * Organizes topics horizontally and by prerequisite depth vertically
 */
export function calculateHierarchicalLayout(): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}

  // Collect all topics across all units with their subtopics
  const allTopics: { topic: any; subtopics: Subtopic[] }[] = []
  CURRICULUM.units.forEach(unit => {
    unit.topics.forEach(topic => {
      allTopics.push({ topic, subtopics: topic.subtopics })
    })
  })

  // Calculate horizontal spacing between topics
  const TOPIC_HORIZONTAL_SPACING = 450 // Space between different topics
  
  let currentTopicX = 0
  
  allTopics.forEach(({ topic, subtopics }) => {
    // Calculate depth (prerequisite level) for subtopics within this topic
    const depths = calculateSubtopicDepths(subtopics)
    const maxDepth = Math.max(...Object.values(depths), 0)
    
    // Group subtopics by depth (vertical layers)
    const layers: Subtopic[][] = []
    for (let d = 0; d <= maxDepth; d++) {
      layers[d] = subtopics.filter(sub => depths[sub.id] === d)
    }
    
    // Position nodes for this topic
    layers.forEach((layer, layerIndex) => {
      layer.forEach((subtopic, indexInLayer) => {
        const x = currentTopicX + layerIndex * HORIZONTAL_SPACING
        const y = indexInLayer * VERTICAL_SPACING
        
        positions[subtopic.id] = { x, y }
      })
    })
    
    // Move to next topic column
    // Width is based on max depth (number of columns needed)
    currentTopicX += (maxDepth + 1) * HORIZONTAL_SPACING + TOPIC_HORIZONTAL_SPACING
  })

  return positions
}

/**
 * Calculate depth (level) for each subtopic based on prerequisite chain
 * Depth 0 = no prerequisites, depth 1 = depends on depth 0, etc.
 */
function calculateSubtopicDepths(subtopics: Subtopic[]): Record<string, number> {
  const depths: Record<string, number> = {}

  function calculateDepth(subtopic: Subtopic): number {
    if (depths[subtopic.id] !== undefined) {
      return depths[subtopic.id]
    }

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
          type: MarkerType.ArrowClosed,
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

