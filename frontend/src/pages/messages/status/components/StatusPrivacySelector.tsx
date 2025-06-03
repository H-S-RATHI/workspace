import React from 'react';
import { Globe, UserCheck, Users, Lock } from 'lucide-react';

interface StatusPrivacySelectorProps {
  privacy: 'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM';
  setPrivacy: (val: 'PUBLIC' | 'CONTACTS' | 'CLOSE_FRIENDS' | 'CUSTOM') => void;
}

const options = [
  { value: 'PUBLIC', label: 'Everyone', icon: Globe },
  { value: 'CONTACTS', label: 'Contacts & Chats', icon: UserCheck },
  { value: 'CLOSE_FRIENDS', label: 'Close Friends', icon: Users },
  { value: 'CUSTOM', label: 'Custom', icon: Lock },
];

const StatusPrivacySelector: React.FC<StatusPrivacySelectorProps> = ({ privacy, setPrivacy }) => (
  <div>
    <p className="text-sm font-medium text-gray-700 mb-2">Who can see this?</p>
    <div className="space-y-2">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setPrivacy(value as any)}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
            privacy === value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default StatusPrivacySelector; 