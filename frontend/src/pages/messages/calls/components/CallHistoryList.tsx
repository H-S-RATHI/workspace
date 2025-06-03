import React, { useEffect, useState } from 'react';
import { chatAPI } from '../../../../services/api';
import { useAuthStore } from '../../../../store/authStore';
import { Call } from '../../../../types/chat';
import { useCall } from '../hooks/useCall';

const formatDuration = (seconds?: number) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CallHistoryList: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const { initiateCall } = useCall();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    chatAPI.getCallHistory()
      .then((res) => {
        if (mounted && res.success) setCalls(res.calls);
      })
      .catch((err) => {
        if (mounted) setError('Failed to load call history');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-gray-500">Loading call history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!calls.length) return <div className="text-gray-500">No calls yet.</div>;

  return (
    <div className="space-y-3">
      {calls.map((call) => {
        const { otherParty, callType, status, startedAt, duration, isIncoming, callId } = call;
        const direction = isIncoming ? 'Incoming' : 'Outgoing';
        const statusColor = status === 'REJECTED' ? 'text-red-600' : status === 'ENDED' ? 'text-gray-600' : 'text-green-600';
        return (
          <div key={callId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {otherParty.profilePhotoUrl ? (
                  <img src={otherParty.profilePhotoUrl} alt={otherParty.fullName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-white font-semibold">
                    {otherParty.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{otherParty.fullName}</h3>
                <p className={`text-sm ${statusColor}`}>
                  {direction} {callType} call • {formatDuration(duration)}
                </p>
              </div>
              <div className="text-sm text-gray-500">{formatTimeAgo(startedAt)}</div>
              {currentUser && otherParty.userId !== currentUser.userId && (
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title={`Call again (${callType})`}
                  onClick={() => initiateCall(otherParty.userId, callType)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CallHistoryList; 