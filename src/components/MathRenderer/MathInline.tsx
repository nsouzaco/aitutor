import { InlineMath } from 'react-katex'

interface MathInlineProps {
  math: string
}

export default function MathInline({ math }: MathInlineProps) {
  try {
    return <InlineMath math={math} />
  } catch (error) {
    console.error('KaTeX inline rendering error:', error)
    // Fallback to plain text if rendering fails
    return <span className="font-mono text-sm">${math}$</span>
  }
}

