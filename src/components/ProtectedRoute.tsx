import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  onAuthRequired?: () => void
}

export const ProtectedRoute = ({ 
  children, 
  fallback, 
  onAuthRequired 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access this feature
            </p>
          </div>
          <Button onClick={onAuthRequired} className="w-full">
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}