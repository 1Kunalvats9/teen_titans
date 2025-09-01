import { useQuery } from '@tanstack/react-query'

export function useInviteCount() {
  return useQuery({
    queryKey: ['invite-count'],
    queryFn: async () => {
      const response = await fetch('/api/communities/invites')
      if (!response.ok) {
        throw new Error('Failed to fetch invites')
      }
      const data = await response.json()
      return data.invites?.length || 0
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}
