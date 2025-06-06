import { useMemo } from 'react';
import { createLogger } from '@/utils/logger';

export const useLogger = (context: string) => {
  return useMemo(() => createLogger(context), [context]);
};
