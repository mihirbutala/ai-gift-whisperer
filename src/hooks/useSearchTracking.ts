import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export const useSearchTracking = () => {
  const [searchCount, setSearchCount] = useState(0)
  const [canSearch, setCanSearch] = useState(true)
  const [ipAddress, setIpAddress] = useState<string>('')
  const { user } = useAuth()

  // Get user's IP address
  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        setIpAddress(data.ip)
      } catch (error) {
        console.error('Failed to get IP address:', error)
        // Fallback to a placeholder
        setIpAddress('unknown')
      }
    }
    getIpAddress()
  }, [])

  // Check search count for current IP
  useEffect(() => {
    const checkSearchCount = async () => {
      if (!ipAddress) return

      try {
        const { data, error } = await supabase
          .from('user_searches')
          .select('*')
          .eq('ip_address', ipAddress)

        if (error) {
          console.error('Error checking search count:', error)
          return
        }

        const count = data?.length || 0
        setSearchCount(count)
        
        // Allow search if user is authenticated OR if they haven't searched before
        setCanSearch(!!user || count === 0)
      } catch (error) {
        console.error('Error in checkSearchCount:', error)
      }
    }

    checkSearchCount()
  }, [ipAddress, user])

  const recordSearch = async (query: string, type: 'ai_search' | 'product_quote') => {
    if (!ipAddress) return

    try {
      const { error } = await supabase
        .from('user_searches')
        .insert({
          user_id: user?.id || null,
          ip_address: ipAddress,
          search_query: query,
          search_type: type,
          user_agent: navigator.userAgent
        })

      if (error) {
        console.error('Error recording search:', error)
      } else {
        setSearchCount(prev => prev + 1)
        // Update canSearch status
        setCanSearch(!!user || searchCount === 0)
      }
    } catch (error) {
      console.error('Error in recordSearch:', error)
    }
  }

  return {
    searchCount,
    canSearch,
    recordSearch,
    requiresAuth: !user && searchCount > 0
  }
}