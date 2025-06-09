import { useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { MIN_FETCH_INTERVAL, FETCH_DEBOUNCE_DELAY } from '../constants';
interface UseDebouncedFetchProps {
  fetchFunction: () => Promise<void>;
}
export const useDebouncedFetch = ({ fetchFunction }: UseDebouncedFetchProps) => {
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);
  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (force = false) => {
      if (!isMounted.current) return;
      
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      
      // Skip if we've fetched recently and it's not a forced refresh
      if (!force && timeSinceLastFetch < MIN_FETCH_INTERVAL) {
        return;
      }
      
      try {
        await fetchFunction();
        lastFetchTime.current = Date.now();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }, FETCH_DEBOUNCE_DELAY),
    [fetchFunction]
  );
  // Setup visibility change handler
  useEffect(() => {
    isMounted.current = true;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedFetch();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);
  return { debouncedFetch, isMounted };
};