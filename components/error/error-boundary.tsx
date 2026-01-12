"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Client-side error boundary component for catching React errors
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * With custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service
    if (typeof window !== "undefined") {
      import("@/lib/error-tracking/sentry").then(({ captureException }) => {
        captureException(error, {
          level: "error",
          tags: {
            errorBoundary: "react-error-boundary",
          },
          extra: {
            componentStack: errorInfo.componentStack,
          },
        });
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-tactical-red/10 rounded-full p-4 border border-tactical-red/20">
                <AlertTriangle className="h-12 w-12 text-tactical-red" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold uppercase text-white mb-2">
                Component Error
              </h3>
              <p className="text-steel/80 text-sm">
                This component encountered an error and couldn't render.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-gunmetal-light border border-steel/20 rounded p-3">
                <p className="text-xs text-tactical-red font-mono text-left overflow-auto">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              onClick={this.handleReset}
              variant="outline"
              className="border-tactical-red text-tactical-red hover:bg-tactical-red hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundary
 *
 * Usage:
 * export default withErrorBoundary(MyComponent);
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
