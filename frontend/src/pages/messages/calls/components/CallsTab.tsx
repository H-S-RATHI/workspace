import React from 'react';
import CallHistoryList from './CallHistoryList';

const CallsTab = () => (
  <div className="p-6 h-full overflow-y-auto">
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Calls</h2>
        <p className="text-gray-600">Manage your call history and make new calls</p>
      </div>
      <CallHistoryList />
    </div>
  </div>
);

export default CallsTab;