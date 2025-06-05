import React, { useState, useCallback } from 'react';
import { Search, Phone, Video,  Filter } from 'lucide-react';
import CallHistoryList from './CallHistoryList';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export type CallFilter = 'all' | 'missed' | 'incoming' | 'outgoing';


const CallsTab = () => {
  const [activeFilter, setActiveFilter] = useState<CallFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleNewCall = (type: 'audio' | 'video') => {
    // TODO: Implement new call functionality
    console.log('Initiating new', type, 'call');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
            <p className="text-sm text-gray-500">Manage your call history and contacts</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => handleNewCall('audio')}
              title="New voice call"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => handleNewCall('video')}
              title="New video call"
            >
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search calls or contacts"
              className="pl-10 pr-10 py-2 w-full rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title="Filter calls"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {showFilters && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {(['all', 'missed', 'incoming', 'outgoing'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto p-4">
        <CallHistoryList filter={activeFilter} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default CallsTab;