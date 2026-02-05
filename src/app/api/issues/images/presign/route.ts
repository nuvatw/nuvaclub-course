import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { presignImageSchema } from '@/lib/validations/issue'
import {
  generatePresignedPutUrl,
  generateObjectKey,
  getPublicUrl,
  isAllowedContentType,
  isAllowedFileSize,
} from '@/lib/r2'
import { checkRateLimit, RATE_LIMIT_CONFIGS, createRateLimitResponse } from '@/lib/rateLimit'
import type { PresignResponse } from '@/types/issues'

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
    const rateLimitResult = checkRateLimit(user.id, 'presign', RATE_LIMIT_CONFIGS.imagePresign)
    if (!rateLimitResult.success) {
      const response = createRateLimitResponse(rateLimitResult)
      return NextResponse.json(response.body, { status: response.status, headers: response.headers })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = presignImageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || '無效的請求' },
        { status: 400 }
      )
    }

    const { filename, content_type, size, issue_id } = validation.data

    // Additional validation
    if (!isAllowedContentType(content_type)) {
      return NextResponse.json({ error: '不支援的檔案格式，僅支援 jpg, png, webp' }, { status: 400 })
    }

    if (!isAllowedFileSize(size)) {
      return NextResponse.json({ error: '檔案大小超過限制 (最大 10MB)' }, { status: 400 })
    }

    // Generate object key
    const objectKey = generateObjectKey(filename)

    // Get public URL (if bucket is public)
    const publicUrl = getPublicUrl(objectKey)

    // Create image record in database (pending upload)
    const { data: imageRecord, error: dbError } = await supabase
      .from('issue_images')
      .insert({
        issue_id: issue_id || null, // null for pending uploads before issue creation
        object_key: objectKey,
        filename,
        content_type,
        size,
        url: publicUrl,
        uploaded: false,
        uploaded_by: user.id,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Error creating image record:', dbError)
      return NextResponse.json({ error: '無法建立圖片記錄' }, { status: 500 })
    }

    // Generate presigned URL for upload
    const uploadUrl = await generatePresignedPutUrl(objectKey, content_type)

    const response: PresignResponse = {
      uploadUrl,
      objectKey,
      imageId: imageRecord.id,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Presign error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
