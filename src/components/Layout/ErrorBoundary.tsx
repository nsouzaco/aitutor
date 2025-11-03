import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <div className="mb-4 inline-flex rounded-full bg-red-100 p-3">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h1>
            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. Don't worry, your work is safe!
            </p>
            {this.state.error && (
              <details className="mb-6 rounded bg-gray-50 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-gray-600">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

