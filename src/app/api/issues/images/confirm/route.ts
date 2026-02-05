import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmUploadSchema } from '@/lib/validations/issue'
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rateLimit'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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
    const rateLimitResult = checkRateLimit(user.id, 'confirm', RATE_LIMIT_CONFIGS.imageConfirm)
    if (!rateLimitResult.success) {
      const response = createRateLimitResponse(rateLimitResult)
      return NextResponse.json(response.body, { status: response.status, headers: response.headers })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = confirmUploadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || '無效的請求' },
        { status: 400 }
      )
    }

    const { image_id } = validation.data

    // Verify the image belongs to this user and is not yet uploaded
    const { data: image, error: fetchError } = await supabase
      .from('issue_images')
      .select('id, uploaded, uploaded_by')
      .eq('id', image_id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json({ error: '找不到此圖片' }, { status: 404 })
    }

    if (image.uploaded_by !== user.id) {
      return NextResponse.json({ error: '沒有權限' }, { status: 403 })
    }

    if (image.uploaded) {
      // Already confirmed, return success
      return NextResponse.json({ success: true, message: '圖片已確認' })
    }

    // Mark as uploaded
    const { error: updateError } = await supabase
      .from('issue_images')
      .update({ uploaded: true })
      .eq('id', image_id)

    if (updateError) {
      console.error('Error confirming upload:', updateError)
      return NextResponse.json({ error: '無法確認上傳' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm upload error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
