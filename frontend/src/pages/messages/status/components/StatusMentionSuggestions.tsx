import React from 'react';

interface StatusMentionSuggestionsProps {
  showMentions: boolean;
}

const StatusMentionSuggestions: React.FC<StatusMentionSuggestionsProps> = ({ showMentions }) => (
  showMentions ? (
    <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto">
      <p className="text-sm text-gray-600 mb-2">Mention someone:</p>
      {/* TODO: Implement user search and mention functionality */}
      <div className="text-sm text-gray-500">Start typing to search users...</div>
    </div>
  ) : null
);

export default StatusMentionSuggestions; 