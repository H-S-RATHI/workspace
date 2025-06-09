import { useCallback, useRef, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { SEARCH_DEBOUNCE_DELAY } from '../constants';
import { SearchResult } from '../types';
interface UseDebouncedSearchProps {
  searchFunction: (query: string) => Promise<SearchResult[]>;
}
export const useDebouncedSearch = ({ searchFunction }: UseDebouncedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const isMounted = useRef(true);
  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      
      try {
        const results = await searchFunction(query);
        if (isMounted.current) {
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (isMounted.current) {
          setSearchResults([]);
        }
      }
    }, SEARCH_DEBOUNCE_DELAY),
    [searchFunction]
  );
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch(searchQuery);
  };
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  return {
    searchQuery,
    searchResults,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    debouncedSearch
  };
};