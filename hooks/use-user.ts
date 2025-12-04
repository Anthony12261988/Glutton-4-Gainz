'use client'

import { useAuthContext } from '@/lib/auth/auth-context'

export function useUser() {
  return useAuthContext()
}
