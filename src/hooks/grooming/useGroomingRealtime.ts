import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { groomingService } from '@/services/groomingService'
import type { GroomingSession, GroomingProgress } from '@/types/pos'

export function useGroomingRealtime(token?: string) {
  const [session, setSession] = useState<GroomingSession | null>(null)
  const [cat, setCat] = useState<any>(null)
  const [progressList, setProgressList] = useState<GroomingProgress[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load report data
  const loadData = useCallback(async (showLoading = false) => {
    if (!token) {
      setIsLoading(false)
      return
    }
    if (showLoading) setIsLoading(true)

    try {
      const data = await groomingService.fetchReportByToken(token)
      if (data) {
        setSession(data.session)
        setCat(data.cat || data.session?.cat)
        setProgressList(data.progress || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Failed to load live grooming report:', err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [token])

  // Initial load
  useEffect(() => {
    loadData(true)
  }, [loadData])

  // Supabase Realtime Subscription + fallback polling
  useEffect(() => {
    if (!token) return

    // Setup Supabase Realtime channel
    const channel = supabase
      .channel(`grooming-live-${token}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'pos',
          table: 'grooming_sessions',
          filter: `public_token=eq.${token}`,
        },
        () => {
          loadData(false)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'pos',
          table: 'grooming_progress',
        },
        () => {
          loadData(false)
        }
      )
      .subscribe()

    // 8-second fallback polling interval
    const interval = setInterval(() => {
      loadData(false)
    }, 8000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [token, loadData])

  return {
    session,
    cat,
    progressList,
    isLoading,
    lastUpdated,
    refresh: () => loadData(false),
  }
}
