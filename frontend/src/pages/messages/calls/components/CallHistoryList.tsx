import React, { useEffect, useState, useMemo } from 'react';
import { chatAPI } from '../../../../services/api';
import { useAuthStore } from '../../../../store/authStore';
import { Call } from '../../../../types/chat';
import { useCall } from '../hooks/useCall';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';

type CallFilter = 'all' | 'missed' | 'incoming' | 'outgoing';

interface CallHistoryListProps {
  filter?: CallFilter;
  searchQuery?: string;
}

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

const getStatusIcon = (status: string, isIncoming: boolean) => {
  // Convert status to string and uppercase for case-insensitive comparison
  const statusStr = String(status).toUpperCase();
  
  // Handle all possible status values
  if (statusStr === 'REJECTED' || statusStr === 'MISSED' || statusStr === 'MISSED_CALL') {
    return <PhoneMissed className="h-4 w-4 text-red-500" />;
  }
  
  return isIncoming 
    ? <PhoneIncoming className="h-4 w-4 text-gray-500" />
    : <PhoneOutgoing className="h-4 w-4 text-gray-500" />;
};

const CallHistoryList: React.FC<CallHistoryListProps> = ({ filter = 'all', searchQuery = '' }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const { initiateCall } = useCall();

  const handleCall = (userId: string, callType: 'audio' | 'video') => {
    if (currentUser?.userId !== userId) {
      initiateCall({ targetUserId: userId, callType });
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    chatAPI.getCallHistory()
      .then((res) => {
        if (mounted && res.success) setCalls(res.calls);
      })
      .catch(() => {
        if (mounted) setError('Failed to load call history');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filteredCalls = useMemo(() => {
    if (filter === 'all') return calls;
    if (filter === 'missed') {
      return calls.filter((call) => {
        // Handle all possible missed call statuses
        const status = String(call.status).toUpperCase();
        return status === 'REJECTED' || status === 'MISSED' || status === 'MISSED_CALL';
      });
    }
    if (filter === 'incoming') return calls.filter((call) => call.isIncoming);
    if (filter === 'outgoing') return calls.filter((call) => !call.isIncoming);
    return [];
  }, [calls, filter]);

  const searchedCalls = useMemo(() => {
    if (!searchQuery) return filteredCalls;
    return filteredCalls.filter((call) => 
      (call.otherParty.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (call.otherParty.username?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [filteredCalls, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="h-8 w-8 mb-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <p>Loading call history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 p-4 text-center">
        <div className="h-12 w-12 mb-3 text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" />
          </svg>
        </div>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!searchedCalls.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 text-center p-4">
        <Clock className="h-12 w-12 mb-3 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No calls found</h3>
        <p className="text-sm text-gray-500">
          {searchQuery || filter !== 'all' 
            ? 'Try adjusting your search or filter'
            : 'Make your first call to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searchedCalls.map((call) => {
        const { otherParty, callType, status, startedAt, duration, isIncoming, callId } = call;
        const direction = isIncoming ? 'Incoming' : 'Outgoing';
        // Safely check for missed call statuses
        const isMissed = String(status).toUpperCase() === 'REJECTED' || 
                        String(status).toUpperCase() === 'MISSED' ||
                        String(status).toUpperCase() === 'MISSED_CALL';
        const statusColor = isMissed ? 'text-red-600' : 'text-gray-600';

        return (
          <div 
            key={callId} 
            className="group bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              {/* Call Type Icon */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {callType === 'video' ? (
                    <Video className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  {getStatusIcon(status, isIncoming)}
                </div>
              </div>

              {/* Call Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${isMissed ? 'text-red-600' : 'text-gray-900'}`}>
                    {otherParty.fullName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(startedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${statusColor}`}>
                    {direction} • {formatDuration(duration)}
                  </span>
                  {callType === 'video' && (
                    <span className="text-xs text-gray-400">• Video</span>
                  )}
                </div>
              </div>

              {/* Call Action */}
              {currentUser?.userId !== otherParty.userId && (
                <button
                  onClick={() => handleCall(otherParty.userId, callType)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  title={`Call ${callType === 'video' ? 'video' : ''}`}
                >
                  {callType === 'video' ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <Phone className="h-5 w-5" />
                  )}
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