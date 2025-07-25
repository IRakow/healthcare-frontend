import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }
  
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center text-red-600">
          <div className="text-5xl mb-4">💊</div>
          <h2 className="text-2xl font-bold">System Error</h2>
          <p className="text-sm mt-2">Something went wrong. Please reload or contact admin.</p>
        </div>
      );
    }

    return this.props.children;
  }
}