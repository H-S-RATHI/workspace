import React from 'react';
import { X } from 'lucide-react';

interface StatusMediaPreviewProps {
  mediaPreview: string;
  mediaType: 'IMAGE' | 'VIDEO';
  onRemove: () => void;
}

const StatusMediaPreview: React.FC<StatusMediaPreviewProps> = ({ mediaPreview, mediaType, onRemove }) => (
  <div className="relative rounded-lg overflow-hidden">
    {mediaType === 'IMAGE' ? (
      <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
    ) : (
      <video src={mediaPreview} className="w-full h-48 object-cover" controls />
    )}
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export default StatusMediaPreview; 