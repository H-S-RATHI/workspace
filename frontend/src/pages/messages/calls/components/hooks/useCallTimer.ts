import { useState, useEffect, useRef } from 'react';

export const useCallTimer = (isActive: boolean) => {
  const [callDuration, setCallDuration] = useState(0);
  const callStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      if (!callStartTimeRef.current) {
        callStartTimeRef.current = Date.now();
      }

      interval = setInterval(() => {
        if (callStartTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      callStartTimeRef.current = null;
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    callDuration,
    formattedDuration: formatDuration(callDuration)
  };
};

export default useCallTimer;
