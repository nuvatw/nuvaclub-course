export type Database = {
  public: {
    Tables: {
      app_admins: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          gender: 'male' | 'female' | null
          role: 'admin' | 'member'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'member'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'member'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          launch_date: string | null
          current_step_index: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          launch_date?: string | null
          current_step_index?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          launch_date?: string | null
          current_step_index?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_steps: {
        Row: {
          id: string
          project_id: string
          step_index: number
          name: string
          category: string
          relative_timing: string
          estimated_hours: number
          actual_hours: number | null
          status: 'not_started' | 'in_progress' | 'done'
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          step_index: number
          name: string
          category: string
          relative_timing: string
          estimated_hours: number
          actual_hours?: number | null
          status?: 'not_started' | 'in_progress' | 'done'
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          step_index?: number
          name?: string
          category?: string
          relative_timing?: string
          estimated_hours?: number
          actual_hours?: number | null
          status?: 'not_started' | 'in_progress' | 'done'
          started_at?: string | null
          completed_at?: string | null
        }
      }
      step_time_averages: {
        Row: {
          step_index: number
          step_name: string
          category: string
          default_hours: number
          average_hours: number
          total_completed: number
          total_hours: number
          updated_at: string
        }
        Insert: {
          step_index: number
          step_name: string
          category: string
          default_hours: number
          average_hours: number
          total_completed?: number
          total_hours?: number
          updated_at?: string
        }
        Update: {
          step_index?: number
          step_name?: string
          category?: string
          default_hours?: number
          average_hours?: number
          total_completed?: number
          total_hours?: number
          updated_at?: string
        }
      }
      step_links: {
        Row: {
          id: string
          project_id: string
          step_id: string
          title: string
          url: string
          visibility: 'public' | 'private'
          link_type: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          step_id: string
          title: string
          url: string
          visibility: 'public' | 'private'
          link_type?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          step_id?: string
          title?: string
          url?: string
          visibility?: 'public' | 'private'
          link_type?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_comments: {
        Row: {
          id: string
          project_id: string
          author_id: string
          author_name: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          author_name: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_id?: string
          author_name?: string
          body?: string
          created_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectStep = Database['public']['Tables']['project_steps']['Row']
export type StepLink = Database['public']['Tables']['step_links']['Row']
export type ProjectComment = Database['public']['Tables']['project_comments']['Row']
export type StepTimeAverage = Database['public']['Tables']['step_time_averages']['Row']

export type ProjectWithSteps = Project & {
  project_steps: ProjectStep[]
}

export type StepWithLinks = ProjectStep & {
  step_links: StepLink[]
}
