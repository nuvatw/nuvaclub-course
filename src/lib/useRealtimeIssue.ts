'use client'

/**
 * useRealtimeIssue - Supabase Realtime subscription hook for issues
 *
 * This hook subscribes to real-time changes on the `issues` table for a specific issue ID.
 * It uses Supabase's Realtime feature with PostgreSQL Change Data Capture (CDC).
 *
 * How it works:
 * 1. Creates a channel subscription filtered by issue ID
 * 2. Listens for INSERT, UPDATE, and DELETE events on the issues table
 * 3. Updates local state when changes are detected
 * 4. Automatically cleans up the subscription when the component unmounts
 *
 * Events handled:
 * - UPDATE: Merges new data with existing issue state
 * - DELETE: Sets issue to null and triggers optional onDelete callback
 * - INSERT: Not typically needed for single-issue view but handled for completeness
 *
 * To enable realtime for the issues table in Supabase:
 * 1. Go to Database > Replication in your Supabase dashboard
 * 2. Enable replication for the "issues" table
 * 3. Ensure your RLS policies allow the user to SELECT from the issues table
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Issue } from '@/types/issues'

interface UseRealtimeIssueOptions {
  /** Called when the issue is deleted via realtime */
  onDelete?: () => void
  /** Called when the issue is updated via realtime */
  onUpdate?: (issue: Issue) => void
  /** Whether to enable realtime subscriptions (default: true) */
  enabled?: boolean
}

interface UseRealtimeIssueResult {
  /** The current issue data, updated in realtime */
  issue: Issue | null
  /** Whether a realtime connection is active */
  isConnected: boolean
  /** Any error that occurred during subscription */
  error: Error | null
}

/**
 * Subscribe to realtime changes for a specific issue
 *
 * @param initialIssue - The initial issue data (can be null if not yet loaded)
 * @param options - Configuration options for the subscription
 * @returns Object containing issue state, connection status, and any errors
 *
 * @example
 * ```tsx
 * function IssueDetailPage({ issue: initialIssue }: Props) {
 *   const { issue, isConnected } = useRealtimeIssue(initialIssue, {
 *     onDelete: () => router.push('/issues'),
 *     onUpdate: (updated) => console.log('Issue updated:', updated.title),
 *   })
 *
 *   return (
 *     <div>
 *       {isConnected && <span>Live updates active</span>}
 *       <h1>{issue?.title}</h1>
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeIssue(
  initialIssue: Issue | null,
  options: UseRealtimeIssueOptions = {}
): UseRealtimeIssueResult {
  const { onDelete, onUpdate, enabled = true } = options

  const [issue, setIssue] = useState<Issue | null>(initialIssue)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to avoid stale closures in callbacks
  const onDeleteRef = useRef(onDelete)
  const onUpdateRef = useRef(onUpdate)

  useEffect(() => {
    onDeleteRef.current = onDelete
    onUpdateRef.current = onUpdate
  }, [onDelete, onUpdate])

  // Update local state when initial issue changes (e.g., from server refetch)
  useEffect(() => {
    setIssue(initialIssue)
  }, [initialIssue])

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<Issue>) => {
      const eventType = payload.eventType

      if (eventType === 'UPDATE') {
        const newIssue = payload.new as Issue
        setIssue(newIssue)
        onUpdateRef.current?.(newIssue)
      } else if (eventType === 'DELETE') {
        setIssue(null)
        onDeleteRef.current?.()
      } else if (eventType === 'INSERT') {
        // INSERT is unlikely for a single-issue subscription but handle it
        const newIssue = payload.new as Issue
        setIssue(newIssue)
        onUpdateRef.current?.(newIssue)
      }
    },
    []
  )

  useEffect(() => {
    const issueId = initialIssue?.id
    if (!issueId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    // Create a unique channel name for this issue
    const channelName = `issue-${issueId}`

    channel = supabase
      .channel(channelName)
      .on<Issue>(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'issues',
          filter: `id=eq.${issueId}`,
        },
        handlePayload
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError(new Error('Failed to subscribe to realtime channel'))
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError(new Error('Realtime subscription timed out'))
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    // Cleanup function: unsubscribe and remove channel
    return () => {
      if (channel) {
        channel.unsubscribe()
        supabase.removeChannel(channel)
      }
      setIsConnected(false)
    }
  }, [initialIssue?.id, enabled, handlePayload])

  return { issue, isConnected, error }
}
