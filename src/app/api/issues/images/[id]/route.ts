import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteObject } from '@/lib/r2'
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rateLimit'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: imageId } = await params

    // Authenticate user
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: '資料庫未設定' }, { status: 500 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未登入' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = checkRateLimit(user.id, 'delete', RATE_LIMIT_CONFIGS.imageDelete)
    if (!rateLimitResult.success) {
      const response = createRateLimitResponse(rateLimitResult)
      return NextResponse.json(response.body, { status: response.status, headers: response.headers })
    }

    // Get the image
    const { data: image, error: fetchError } = await supabase
      .from('issue_images')
      .select('id, object_key, uploaded_by, issue_id')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return NextResponse.json({ error: '找不到此圖片' }, { status: 404 })
    }

    // Check permissions
    let canDelete = false

    // Uploader can delete
    if (image.uploaded_by === user.id) {
      canDelete = true
    }

    // Issue creator can delete
    if (!canDelete && image.issue_id) {
      const { data: issue } = await supabase
        .from('issues')
        .select('created_by')
        .eq('id', image.issue_id)
        .single()

      if (issue?.created_by === user.id) {
        canDelete = true
      }
    }

    // Admin can delete
    if (!canDelete) {
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin')
      if (isAdmin) {
        canDelete = true
      }
    }

    if (!canDelete) {
      return NextResponse.json({ error: '沒有權限刪除此圖片' }, { status: 403 })
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('issue_images')
      .delete()
      .eq('id', imageId)

    if (deleteError) {
      console.error('Error deleting image record:', deleteError)
      return NextResponse.json({ error: '無法刪除圖片' }, { status: 500 })
    }

    // Delete from R2
    try {
      await deleteObject(image.object_key)
    } catch (r2Error) {
      console.error('Error deleting from R2:', r2Error)
      // Don't fail the request, DB record is already deleted
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
