/**
 * KnowledgeGraph - Interactive curriculum visualization with React Flow
 * Shows prerequisite relationships and mastery status
 */

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { convertCurriculumToReactFlow } from '../../utils/graphLayoutUtils'
import { StudentProgress } from '../../types/progress'
import { CheckCircle, Circle, Lock, PlayCircle } from 'lucide-react'

interface KnowledgeGraphProps {
  userProgress?: StudentProgress
  onNodeClick?: (subtopicId: string) => void
}

export function KnowledgeGraph({ userProgress, onNodeClick }: KnowledgeGraphProps) {
  // Convert curriculum to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertCurriculumToReactFlow(userProgress),
    [userProgress]
  )

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node.id)
      }
    },
    [onNodeClick]
  )

  return (
    <div className="w-full h-[600px] bg-white rounded-lg border border-gray-200 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status
            switch (status) {
              case 'mastered':
                return '#10b981'
              case 'in-progress':
                return '#fbbf24'
              case 'locked':
                return '#f3f4f6'
              default:
                return '#ffffff'
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Panel position="top-right" className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 m-4">
          <Legend />
        </Panel>
      </ReactFlow>
    </div>
  )
}

/**
 * Legend component
 */
function Legend() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-700 mb-2">Legend</h3>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-xs text-gray-600">Mastered</span>
        </div>
        <div className="flex items-center space-x-2">
          <PlayCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <Circle className="w-4 h-4 text-gray-600" />
          <span className="text-xs text-gray-600">Not Started</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-600">Locked</span>
        </div>
      </div>
    </div>
  )
}

