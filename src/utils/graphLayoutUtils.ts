/**
 * Graph Layout Utilities for React Flow
 * 
 * Converts curriculum data into React Flow nodes and edges
 * Provides auto-layout algorithms and styling based on mastery status
 */

import { Node, Edge } from 'reactflow'
import { SubtopicStatus } from '../types/curriculum'
import { CURRICULUM, getAllSubtopics } from '../data/curriculum'
import { StudentProgress } from '../types/progress'

// Node dimensions for layout calculations
const NODE_WIDTH = 220
const NODE_HEIGHT = 100

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
 * Convert curriculum to React Flow nodes and edges with parent-child hierarchy
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

  // Layout configuration
  const TOPIC_WIDTH = 450
  const TOPIC_SPACING = 100
  const SUBTOPIC_Y_START = 100
  const SUBTOPIC_Y_SPACING = 90
  
  let currentX = 0

  // Create topic parent nodes and their subtopic children
  CURRICULUM.units.forEach(unit => {
    unit.topics.forEach(topic => {
      // Calculate topic height based on number of subtopics
      const topicHeight = SUBTOPIC_Y_START + (topic.subtopics.length * SUBTOPIC_Y_SPACING) + 40
      
      // Create parent topic node (group node)
      const topicId = topic.id
      nodes.push({
        id: topicId,
        type: 'group',
        position: { x: currentX, y: 0 },
        data: { 
          label: topic.name,
          description: topic.description 
        },
        style: {
          width: TOPIC_WIDTH,
          height: topicHeight,
          background: 'linear-gradient(to bottom, rgba(249, 250, 251, 0.95), rgba(255, 255, 255, 0.9))',
          border: '3px solid #d1d5db',
          borderRadius: '16px',
          padding: '20px',
          fontSize: '16px',
          fontWeight: 700,
          color: '#1f2937',
        },
      })

      // Create subtopic child nodes
      topic.subtopics.forEach((subtopic, index) => {
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

        nodes.push({
          id: subtopic.id,
          type: 'default',
          position: { 
            x: 20, 
            y: SUBTOPIC_Y_START + (index * SUBTOPIC_Y_SPACING)
          },
          parentNode: topicId,
          extent: 'parent' as const,
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
            borderRadius: '10px',
            padding: '12px 16px',
            width: TOPIC_WIDTH - 60,
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        })

        // Create edge from parent topic to subtopic
        edges.push({
          id: `${topicId}-${subtopic.id}`,
          source: topicId,
          target: subtopic.id,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#d1d5db',
            strokeWidth: 2,
          },
        })
      })

      currentX += TOPIC_WIDTH + TOPIC_SPACING
    })
  })

  console.log('🎨 [GraphLayout] Created', nodes.length, 'nodes and', edges.length, 'edges')
  return { nodes, edges }
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
  getNodeColor,
  getStatusIcon,
  getStatusLabel,
  calculateViewportBounds,
}

