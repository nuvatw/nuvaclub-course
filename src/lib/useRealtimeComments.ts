'use client'

/**
 * useRealtimeComments - Supabase Realtime subscription hook for project comments
 *
 * This hook subscribes to real-time changes on the `project_comments` table for a specific project.
 * It enables a live comment wall where users can see new comments appear instantly
 * without refreshing the page.
 *
 * How it works:
 * 1. Creates a channel subscription filtered by project_id
 * 2. Listens for INSERT (new comments) and DELETE (removed comments) events
 * 3. Updates the comments array in real-time, maintaining chronological order
 * 4. Automatically cleans up the subscription when unmounted
 *
 * Events handled:
 * - INSERT: Adds new comment to the beginning of the array (newest first)
 * - DELETE: Removes the deleted comment from the array
 * - UPDATE: Updates the comment content (if editing is supported)
 *
 * To enable realtime for project_comments in Supabase:
 * 1. Go to Database > Replication in your Supabase dashboard
 * 2. Enable replication for the "project_comments" table
 * 3. Ensure your RLS policies allow the user to SELECT from project_comments
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { ProjectComment } from '@/types/database'

interface UseRealtimeCommentsOptions {
  /** Called when a new comment is added via realtime */
  onCommentInsert?: (comment: ProjectComment) => void
  /** Called when a comment is deleted via realtime */
  onCommentDelete?: (commentId: string) => void
  /** Called when a comment is updated via realtime */
  onCommentUpdate?: (comment: ProjectComment) => void
  /** Whether to enable realtime subscriptions (default: true) */
  enabled?: boolean
  /** Sort order for comments: 'newest' (default) or 'oldest' first */
  sortOrder?: 'newest' | 'oldest'
}

interface UseRealtimeCommentsResult {
  /** The current comments array, updated in realtime */
  comments: ProjectComment[]
  /** Whether a realtime connection is active */
  isConnected: boolean
  /** Any error that occurred during subscription */
  error: Error | null
}

/**
 * Subscribe to realtime changes for all comments on a specific project
 *
 * @param projectId - The project ID to subscribe to
 * @param initialComments - The initial comments array (can be empty)
 * @param options - Configuration options for the subscription
 * @returns Object containing comments state, connection status, and any errors
 *
 * @example
 * ```tsx
 * function ProjectCommentWall({ projectId, initialComments }: Props) {
 *   const { comments, isConnected } = useRealtimeComments(projectId, initialComments, {
 *     onCommentInsert: (comment) => {
 *       // Optionally show a notification for new comments
 *       if (comment.author_id !== currentUserId) {
 *         showToast({ type: 'info', message: `${comment.author_name} added a comment` })
 *       }
 *     },
 *   })
 *
 *   return (
 *     <div>
 *       {isConnected && <span className="text-green-500">Live</span>}
 *       {comments.map(comment => (
 *         <CommentCard key={comment.id} comment={comment} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeComments(
  projectId: string | null | undefined,
  initialComments: ProjectComment[],
  options: UseRealtimeCommentsOptions = {}
): UseRealtimeCommentsResult {
  const {
    onCommentInsert,
    onCommentDelete,
    onCommentUpdate,
    enabled = true,
    sortOrder = 'newest',
  } = options

  const [comments, setComments] = useState<ProjectComment[]>(initialComments)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to avoid stale closures in callbacks
  const onCommentInsertRef = useRef(onCommentInsert)
  const onCommentDeleteRef = useRef(onCommentDelete)
  const onCommentUpdateRef = useRef(onCommentUpdate)
  const sortOrderRef = useRef(sortOrder)

  useEffect(() => {
    onCommentInsertRef.current = onCommentInsert
    onCommentDeleteRef.current = onCommentDelete
    onCommentUpdateRef.current = onCommentUpdate
    sortOrderRef.current = sortOrder
  }, [onCommentInsert, onCommentDelete, onCommentUpdate, sortOrder])

  // Update local state when initial comments change (e.g., from server refetch)
  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  const sortComments = useCallback((commentsToSort: ProjectComment[]): ProjectComment[] => {
    return [...commentsToSort].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrderRef.current === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [])

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<ProjectComment>) => {
      const eventType = payload.eventType

      if (eventType === 'INSERT') {
        const newComment = payload.new as ProjectComment
        setComments((currentComments) => {
          // Avoid duplicates - check if comment already exists
          if (currentComments.some((c) => c.id === newComment.id)) {
            return currentComments
          }
          return sortComments([...currentComments, newComment])
        })
        onCommentInsertRef.current?.(newComment)
      } else if (eventType === 'DELETE') {
        const deletedComment = payload.old as ProjectComment
        setComments((currentComments) =>
          currentComments.filter((comment) => comment.id !== deletedComment.id)
        )
        onCommentDeleteRef.current?.(deletedComment.id)
      } else if (eventType === 'UPDATE') {
        const updatedComment = payload.new as ProjectComment
        setComments((currentComments) =>
          currentComments.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment
          )
        )
        onCommentUpdateRef.current?.(updatedComment)
      }
    },
    [sortComments]
  )

  useEffect(() => {
    if (!projectId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    // Create a unique channel name for this project's comments
    const channelName = `project-comments-${projectId}`

    channel = supabase
      .channel(channelName)
      .on<ProjectComment>(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'project_comments',
          filter: `project_id=eq.${projectId}`,
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
  }, [projectId, enabled, handlePayload])

  return { comments, isConnected, error }
}
