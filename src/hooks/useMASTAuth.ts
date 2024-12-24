import { useState, useEffect, useCallback } from 'react'
import { mastAuthService, MASTUserProfile } from '@/services/mastAuthService'

interface UseMASTAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  userProfile: MASTUserProfile | null
}

export function useMASTAuth() {
  const [state, setState] = useState<UseMASTAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    userProfile: null
  })

  const initializeAuth = useCallback(async () => {
    try {
      const isAuthenticated = await mastAuthService.initialize()
      if (isAuthenticated) {
        const userProfile = mastAuthService.getUserProfile()
        setState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          userProfile
        })
      } else {
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed',
          userProfile: null
        })
      }
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        userProfile: null
      })
    }
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const checkDataRights = useCallback(async (dataset: string) => {
    if (!state.isAuthenticated) return false
    return mastAuthService.checkDataRights(dataset)
  }, [state.isAuthenticated])

  const hasPermission = useCallback((permission: string) => {
    return mastAuthService.hasPermission(permission)
  }, [])

  const logout = useCallback(() => {
    mastAuthService.logout()
    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      userProfile: null
    })
  }, [])

  return {
    ...state,
    checkDataRights,
    hasPermission,
    logout,
    reinitialize: initializeAuth
  }
}
