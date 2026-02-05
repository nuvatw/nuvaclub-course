'use client'

import { motion } from 'framer-motion'
import { ProjectCard } from './ProjectCard'
import type { ProjectStep } from '@/types/database'

interface Project {
  id: string
  title: string
  description: string | null
  current_step_index: number
  project_steps: ProjectStep[]
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card-hover flex items-center justify-center">
          <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-muted text-lg">目前沒有進行中的專案</p>
        <p className="text-sm text-muted/60 mt-1">建立第一個專案開始追蹤進度</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          description={project.description}
          currentStepIndex={project.current_step_index}
          steps={project.project_steps}
          index={index}
        />
      ))}
    </div>
  )
}
