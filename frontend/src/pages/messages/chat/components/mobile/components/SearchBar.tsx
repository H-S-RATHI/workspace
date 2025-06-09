import React from 'react';
import { Search } from 'lucide-react';
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}
export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
      <form onSubmit={onSearchSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search or start new chat"
          className="block w-full pl-10 pr-3 py-2 border-0 rounded-xl bg-white/20 backdrop-blur-sm placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Search conversations or users"
        />
      </form>
    </div>
  );
};