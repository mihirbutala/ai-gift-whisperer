import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/sonner'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Create/update user profile if user exists
      if (session?.user) {
        createOrUpdateUserProfile(session.user)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Create/update user profile on auth state change
      if (session?.user) {
        createOrUpdateUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createOrUpdateUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error creating/updating user profile:', error)
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      if (data.user && !data.session) {
        toast.success('Please check your email for verification link')
      } else {
        toast.success('Account created successfully!')
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error(error.message || 'Failed to sign out')
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  }
}