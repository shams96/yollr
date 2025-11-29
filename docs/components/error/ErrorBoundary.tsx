'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Documentation site error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    // Clear any search state that might have caused the error
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <AlertCircle className="h-12 w-12 text-red-500 mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mt-1">
                  The documentation site encountered an error
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-700 mb-2">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <details className="text-xs text-red-600">
                  <summary className="cursor-pointer mb-2">Stack Trace</summary>
                  <pre className="overflow-x-auto bg-red-100 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Application
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If this error persists, please contact our support team with the error details above.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/support"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Visit Support Page
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="mailto:support@yollr.com"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}