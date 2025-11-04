import { Fragment } from 'react'
import MathInline from './MathInline'
import MathBlock from './MathBlock'

interface MathContentProps {
  content: string
}

/**
 * Parse and render text with LaTeX math notation
 * Supports:
 * - Inline math: $x^2 + 5$
 * - Block math: $$\frac{a}{b}$$
 */
export default function MathContent({ content }: MathContentProps) {
  // Split content by block math ($$...$$) and inline math ($...$)
  const parts = parseMathContent(content)

  return (
    <>
      {parts.map((part, partIndex) => {
        if (part.type === 'block') {
          return <MathBlock key={partIndex} math={part.content} />
        } else if (part.type === 'inline') {
          return <MathInline key={partIndex} math={part.content} />
        } else {
          // Regular text - preserve whitespace and newlines
          const lines = part.content.split('\n')
          return lines.map((line, lineIndex) => (
            <Fragment key={`${partIndex}-${lineIndex}`}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </Fragment>
          ))
        }
      })}
    </>
  )
}

interface ContentPart {
  type: 'text' | 'inline' | 'block'
  content: string
}

/**
 * Parse content and split into text and math parts
 * Handles both $...$ (inline) and $$...$$ (block) math
 */
function parseMathContent(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  let remaining = content

  while (remaining.length > 0) {
    // Check for block math ($$...$$) first - must come before inline to avoid conflicts
    const blockMatch = remaining.match(/\$\$(.*?)\$\$/s)
    if (blockMatch && blockMatch.index !== undefined) {
      // Add text before block math
      if (blockMatch.index > 0) {
        parts.push({
          type: 'text',
          content: remaining.slice(0, blockMatch.index),
        })
      }

      // Add block math (remove any leading/trailing whitespace)
      const mathContent = blockMatch[1].trim()
      if (mathContent) {
        parts.push({
          type: 'block',
          content: mathContent,
        })
      }

      remaining = remaining.slice(blockMatch.index + blockMatch[0].length)
      continue
    }

    // Check for inline math ($...$) - must not start with $$ (already handled above)
    // Simple regex that doesn't match if preceded by $
    const inlineMatch = remaining.match(/\$(?!\$)(.*?)\$(?!\$)/)
    if (inlineMatch && inlineMatch.index !== undefined) {
      // Add text before inline math
      if (inlineMatch.index > 0) {
        parts.push({
          type: 'text',
          content: remaining.slice(0, inlineMatch.index),
        })
      }

      // Add inline math (remove any leading/trailing whitespace)
      const mathContent = inlineMatch[1].trim()
      if (mathContent) {
        parts.push({
          type: 'inline',
          content: mathContent,
        })
      }

      remaining = remaining.slice(inlineMatch.index + inlineMatch[0].length)
      continue
    }

    // No more math found, add remaining as text
    if (remaining.length > 0) {
      parts.push({
        type: 'text',
        content: remaining,
      })
    }
    break
  }

  return parts
}

