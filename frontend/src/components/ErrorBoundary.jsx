import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-space-grotesk font-bold text-red-500 mb-4">
              ⚠️ Something Went Wrong
            </h2>
            <p className="text-text-secondary mb-4">
              We encountered an error while rendering this page.
            </p>
            <div className="bg-primary-card/50 rounded-lg p-4 mb-4 max-h-40 overflow-auto">
              <p className="text-sm text-red-400 font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <p className="text-xs text-text-secondary font-mono mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-accent hover:bg-accent/80 text-primary-bg font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
