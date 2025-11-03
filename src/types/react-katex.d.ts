declare module 'react-katex' {
  import { FC } from 'react'

  export interface KatexProps {
    math: string
    errorColor?: string
    renderError?: (error: Error) => JSX.Element
    settings?: any
  }

  export const InlineMath: FC<KatexProps>
  export const BlockMath: FC<KatexProps>
}

