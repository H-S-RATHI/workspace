import React from 'react';

interface StatusViewerContentProps {
  currentStatus: any;
}

const StatusViewerContent: React.FC<StatusViewerContentProps> = ({ currentStatus }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {currentStatus.mediaType === 'IMAGE' && currentStatus.mediaUrl ? (
      <img
        src={currentStatus.mediaUrl}
        alt="Status"
        className="max-w-full max-h-full object-contain"
      />
    ) : currentStatus.mediaType === 'VIDEO' && currentStatus.mediaUrl ? (
      <video
        src={currentStatus.mediaUrl}
        autoPlay
        muted
        className="max-w-full max-h-full object-contain"
      />
    ) : (
      <div
        className="w-full h-full flex items-center justify-center p-8"
        style={{ backgroundColor: currentStatus.backgroundColor }}
      >
        <p
          className="text-center text-2xl font-medium max-w-md leading-relaxed"
          style={{ color: currentStatus.textColor }}
        >
          {currentStatus.content}
        </p>
      </div>
    )}
  </div>
);

export default StatusViewerContent; 