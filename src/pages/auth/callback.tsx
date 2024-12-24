import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mastAuthService } from '@/services/mastAuthService'
import { Card } from '@/components/ui/card'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')

      if (error) {
        setError(`Authentication failed: ${error}`)
        return
      }

      if (!code || !state) {
        setError('Missing required parameters')
        return
      }

      try {
        const success = await mastAuthService.handleCallback(code, state)
        if (success) {
          // Redirect to the last page or home
          const returnTo = localStorage.getItem('auth_return_to') || '/'
          localStorage.removeItem('auth_return_to')
          navigate(returnTo)
        } else {
          setError('Failed to complete authentication')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-6 max-w-md">
          <h1 className="text-xl font-bold mb-4">Authentication Error</h1>
          <p className="text-red-500">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">Completing Authentication</h1>
        <p>Please wait while we complete the authentication process...</p>
      </Card>
    </div>
  )
}
