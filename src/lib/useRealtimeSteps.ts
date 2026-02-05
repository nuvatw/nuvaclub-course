'use client'

/**
 * useRealtimeSteps - Supabase Realtime subscription hook for project steps
 *
 * This hook subscribes to real-time changes on the `project_steps` table for a specific project.
 * It enables collaborative features where multiple users can see step status updates in real-time.
 *
 * How it works:
 * 1. Creates a channel subscription filtered by project_id
 * 2. Listens for UPDATE events (status changes, time updates) on project_steps
 * 3. Merges updated steps into the existing steps array
 * 4. Automatically cleans up the subscription when unmounted
 *
 * Events handled:
 * - UPDATE: Updates the specific step in the array (status, actual_hours, etc.)
 * - INSERT: Adds new step to the array (rare - steps are usually created with the project)
 * - DELETE: Removes the step from the array (rare - steps are usually not deleted)
 *
 * To enable realtime for project_steps in Supabase:
 * 1. Go to Database > Replication in your Supabase dashboard
 * 2. Enable replication for the "project_steps" table
 * 3. Ensure your RLS policies allow the user to SELECT from project_steps
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { ProjectStep } from '@/types/database'

interface UseRealtimeStepsOptions {
  /** Called when any step is updated via realtime */
  onStepUpdate?: (step: ProjectStep) => void
  /** Called when a step is added via realtime */
  onStepInsert?: (step: ProjectStep) => void
  /** Called when a step is deleted via realtime */
  onStepDelete?: (stepId: string) => void
  /** Whether to enable realtime subscriptions (default: true) */
  enabled?: boolean
}

interface UseRealtimeStepsResult {
  /** The current steps array, updated in realtime */
  steps: ProjectStep[]
  /** Whether a realtime connection is active */
  isConnected: boolean
  /** Any error that occurred during subscription */
  error: Error | null
}

/**
 * Subscribe to realtime changes for all steps of a specific project
 *
 * @param projectId - The project ID to subscribe to
 * @param initialSteps - The initial steps array (can be empty)
 * @param options - Configuration options for the subscription
 * @returns Object containing steps state, connection status, and any errors
 *
 * @example
 * ```tsx
 * function ProjectStepsView({ projectId, initialSteps }: Props) {
 *   const { steps, isConnected } = useRealtimeSteps(projectId, initialSteps, {
 *     onStepUpdate: (step) => {
 *       if (step.status === 'done') {
 *         showToast({ type: 'info', message: `${step.name} completed!` })
 *       }
 *     },
 *   })
 *
 *   return (
 *     <div>
 *       {isConnected && <LiveIndicator />}
 *       {steps.map(step => <StepCard key={step.id} step={step} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeSteps(
  projectId: string | null | undefined,
  initialSteps: ProjectStep[],
  options: UseRealtimeStepsOptions = {}
): UseRealtimeStepsResult {
  const { onStepUpdate, onStepInsert, onStepDelete, enabled = true } = options

  const [steps, setSteps] = useState<ProjectStep[]>(initialSteps)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to avoid stale closures in callbacks
  const onStepUpdateRef = useRef(onStepUpdate)
  const onStepInsertRef = useRef(onStepInsert)
  const onStepDeleteRef = useRef(onStepDelete)

  useEffect(() => {
    onStepUpdateRef.current = onStepUpdate
    onStepInsertRef.current = onStepInsert
    onStepDeleteRef.current = onStepDelete
  }, [onStepUpdate, onStepInsert, onStepDelete])

  // Update local state when initial steps change (e.g., from server refetch)
  useEffect(() => {
    setSteps(initialSteps)
  }, [initialSteps])

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<ProjectStep>) => {
      const eventType = payload.eventType

      if (eventType === 'UPDATE') {
        const updatedStep = payload.new as ProjectStep
        setSteps((currentSteps) =>
          currentSteps.map((step) =>
            step.id === updatedStep.id ? updatedStep : step
          )
        )
        onStepUpdateRef.current?.(updatedStep)
      } else if (eventType === 'INSERT') {
        const newStep = payload.new as ProjectStep
        setSteps((currentSteps) => {
          // Avoid duplicates - check if step already exists
          if (currentSteps.some((s) => s.id === newStep.id)) {
            return currentSteps
          }
          // Insert in correct order by step_index
          const updated = [...currentSteps, newStep]
          return updated.sort((a, b) => a.step_index - b.step_index)
        })
        onStepInsertRef.current?.(newStep)
      } else if (eventType === 'DELETE') {
        const deletedStep = payload.old as ProjectStep
        setSteps((currentSteps) =>
          currentSteps.filter((step) => step.id !== deletedStep.id)
        )
        onStepDeleteRef.current?.(deletedStep.id)
      }
    },
    []
  )

  useEffect(() => {
    if (!projectId || !enabled) {
      return
    }

    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    // Create a unique channel name for this project's steps
    const channelName = `project-steps-${projectId}`

    channel = supabase
      .channel(channelName)
      .on<ProjectStep>(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'project_steps',
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

  return { steps, isConnected, error }
}
