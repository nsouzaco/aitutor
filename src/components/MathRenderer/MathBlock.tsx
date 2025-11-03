import { BlockMath } from 'react-katex'

interface MathBlockProps {
  math: string
}

export default function MathBlock({ math }: MathBlockProps) {
  try {
    return (
      <div className="my-4 overflow-x-auto rounded-lg bg-gray-50 p-4">
        <BlockMath math={math} />
      </div>
    )
  } catch (error) {
    console.error('KaTeX block rendering error:', error)
    // Fallback to plain text if rendering fails
    return (
      <pre className="my-4 overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-sm">
        $${math}$$
      </pre>
    )
  }
}

