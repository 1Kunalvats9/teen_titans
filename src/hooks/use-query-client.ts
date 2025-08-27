import { useQueryStore } from './query-store';

export const useQueryClient = () => {
  const { queryClient, isInitialized } = useQueryStore();
  
  if (!isInitialized) {
    throw new Error('QueryClient not initialized. Make sure QueryProvider is wrapping your app.');
  }
  
  if (!queryClient) {
    throw new Error('QueryClient is null. This should not happen if QueryProvider is properly set up.');
  }
  
  return queryClient;
};
