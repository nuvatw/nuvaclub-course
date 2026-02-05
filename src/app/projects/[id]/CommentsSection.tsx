import { getComments } from '@/app/actions/comments'
import { CommentWall } from '@/components/projects/CommentWall'

interface CommentsSectionProps {
  projectId: string
  isAuthenticated: boolean
  userId?: string
  isAdmin: boolean
}

export async function CommentsSection({ projectId, isAuthenticated, userId, isAdmin }: CommentsSectionProps) {
  const comments = await getComments(projectId)

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        討論區
      </h2>
      <CommentWall
        projectId={projectId}
        comments={comments}
        isAuthenticated={isAuthenticated}
        userId={userId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
