import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#102542] text-white flex flex-col items-center justify-center p-8 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 max-w-md mb-6">An unexpected error occurred. Please refresh the page or try again.</p>
          <button onClick={() => location.reload()} className="bg-[#D4AF37] text-[#102542] font-bold px-6 py-2.5 rounded-xl">Reload</button>
          <p className="text-xs text-gray-500 mt-4">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
