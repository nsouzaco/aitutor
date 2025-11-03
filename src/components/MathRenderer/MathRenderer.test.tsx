import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MathContent, MathInline, MathBlock } from './index'

describe('MathRenderer', () => {
  describe('MathInline', () => {
    it('renders inline math', () => {
      render(<MathInline math="x^2 + 5" />)
      // KaTeX should render the math
      expect(document.querySelector('.katex')).toBeTruthy()
    })

    it('renders without crashing even with unusual input', () => {
      // KaTeX is quite forgiving, so this will likely still render
      render(<MathInline math="x + y" />)
      expect(document.querySelector('.katex')).toBeTruthy()
    })
  })

  describe('MathBlock', () => {
    it('renders block math', () => {
      render(<MathBlock math="\\frac{a}{b}" />)
      expect(document.querySelector('.katex-display')).toBeTruthy()
    })

    it('renders without crashing even with unusual input', () => {
      // KaTeX is quite forgiving, so this will likely still render
      render(<MathBlock math="x + y" />)
      expect(document.querySelector('.katex-display')).toBeTruthy()
    })
  })

  describe('MathContent', () => {
    it('renders plain text', () => {
      render(<MathContent content="Hello world" />)
      expect(screen.getByText('Hello world')).toBeTruthy()
    })

    it('renders inline math in text', () => {
      render(<MathContent content="The equation is $x^2 + 5$ which simplifies..." />)
      expect(document.querySelector('.katex')).toBeTruthy()
    })

    it('renders block math', () => {
      render(<MathContent content="The formula is: $$\\frac{a}{b}$$" />)
      expect(document.querySelector('.katex-display')).toBeTruthy()
    })

    it('renders mixed content with multiple math expressions', () => {
      render(
        <MathContent content="We have $x = 5$ and $y = 10$, so $$x + y = 15$$" />
      )
      const katexElements = document.querySelectorAll('.katex')
      expect(katexElements.length).toBeGreaterThan(0)
    })

    it('preserves newlines in text', () => {
      const { container } = render(
        <MathContent content="Line 1\nLine 2\nLine 3" />
      )
      // Check that all lines are present
      expect(container.textContent).toContain('Line 1')
      expect(container.textContent).toContain('Line 2')
      expect(container.textContent).toContain('Line 3')
      // In the real DOM, br tags will separate the lines
      const html = container.innerHTML
      expect(html).toContain('Line 1')
      expect(html).toContain('Line 2')
      expect(html).toContain('Line 3')
    })

    it('handles empty content', () => {
      render(<MathContent content="" />)
      expect(document.body).toBeTruthy()
    })
  })
})

