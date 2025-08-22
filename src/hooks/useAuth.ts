import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
        // Show success message for OAuth sign-ins
        if (_event === 'SIGNED_IN' && session.user.app_metadata.provider === 'google') {
          // Use a timeout to ensure the UI has updated
          setTimeout(() => {
            console.log('Google sign-in successful')
          }, 100)
        }
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
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user
  }
}