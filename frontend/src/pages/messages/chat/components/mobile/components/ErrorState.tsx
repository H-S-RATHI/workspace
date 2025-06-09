import React from 'react';
interface ErrorStateProps {
  error: string;
  isLoading: boolean;
  isRetrying: boolean;
  onRetry: () => Promise<void>;
}
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  isLoading,
  isRetrying,
  onRetry
}) => {
  const handleRetry = async () => {
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };
  return (
    <div className="p-3 bg-red-50 text-red-600 text-sm flex items-center justify-between">
      <span>{error}</span>
      <button 
        onClick={handleRetry}
        disabled={isLoading || isRetrying}
        className="ml-2 px-3 py-1 bg-white border border-red-200 rounded-md text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {isRetrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );
};