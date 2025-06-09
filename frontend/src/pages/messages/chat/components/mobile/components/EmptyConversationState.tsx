import React from 'react';
interface EmptyConversationStateProps {
  onBack: () => void;
}
export const EmptyConversationState: React.FC<EmptyConversationStateProps> = ({ onBack }) => {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-gray-500">No conversation selected</p>
        <button onClick={onBack} className="mt-2 text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    </div>
  );
};