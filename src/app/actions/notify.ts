'use server'

import { createClient } from '@/lib/supabase/server'
import { getResend, EMAIL_FROM } from '@/lib/resend'
import { notifyEngineerSchema, type NotifyEngineerInput } from '@/lib/validations/issue'
import { checkRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rateLimit'
import {
  ISSUE_CATEGORY_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_PRIORITY_LABELS,
  type IssueCategory,
  type IssueStatus,
  type IssuePriority,
} from '@/types/issues'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvaclub-course-7nlq.vercel.app'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CATEGORY_EMOJI: Record<IssueCategory, string> = {
  fix: '🔧',
  wish: '✨',
}

const PRIORITY_COLOR: Record<IssuePriority, string> = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#3b82f6',
}

const STATUS_COLOR: Record<IssueStatus, string> = {
  not_started: '#71717a',
  in_progress: '#d97706',
  done: '#059669',
  cancelled: '#71717a',
}

interface IssueRow {
  id: string
  issue_number: number
  title: string
  category: IssueCategory
  status: IssueStatus
  priority: IssuePriority
}

function buildEmailHtml(issues: IssueRow[], message?: string): string {
  const issueRows = issues
    .map(
      (issue) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #27272a;">
          <a href="${APP_URL}/issues/${issue.id}" style="color: #e4e4e7; text-decoration: none; font-weight: 600; font-size: 15px;">
            <span style="color: #71717a; font-weight: 400;">#${issue.issue_number}</span>
            ${escapeHtml(issue.title)}
          </a>
          <div style="margin-top: 8px; display: flex; gap: 12px; font-size: 13px;">
            <span>${CATEGORY_EMOJI[issue.category]} ${ISSUE_CATEGORY_LABELS[issue.category].zh}</span>
            <span style="color: ${STATUS_COLOR[issue.status]};">● ${ISSUE_STATUS_LABELS[issue.status].zh}</span>
            <span>優先度: <span style="color: ${PRIORITY_COLOR[issue.priority]};">${ISSUE_PRIORITY_LABELS[issue.priority].zh}</span></span>
          </div>
        </td>
      </tr>`
    )
    .join('')

  const messageBlock = message
    ? `
    <div style="background-color: #27272a; border-radius: 8px; padding: 16px; margin-top: 24px; border-left: 3px solid #3b82f6;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 8px 0;">附加訊息</p>
      <p style="color: #e4e4e7; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>`
    : ''

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #e4e4e7; font-size: 20px; margin: 0;">nuvaClub 開發區</h1>
      <p style="color: #71717a; font-size: 14px; margin: 8px 0 0 0;">你有 ${issues.length} 個項目需要關注</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 12px; border: 1px solid #27272a;">
      ${issueRows}
    </table>

    ${messageBlock}

    <div style="text-align: center; margin-top: 32px;">
      <a href="${APP_URL}/issues" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
        前往開發區查看
      </a>
    </div>

    <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 40px;">
      此通知由 nuvaClub 開發追蹤系統發出
    </p>
  </div>
</body>
</html>`
}

export async function notifyEngineer(
  input: NotifyEngineerInput
): Promise<{ success: boolean; error?: string }> {
  // 1. Auth check
  const supabase = await createClient()
  if (!supabase) {
    return { success: false, error: '資料庫未設定' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: '未登入' }
  }

  // 2. Rate limit
  const rateLimitResult = checkRateLimit(user.id, 'notifyEngineer', RATE_LIMIT_CONFIGS.notifyEngineer)
  if (!rateLimitResult.success) {
    return { success: false, error: '發送太頻繁，請稍後再試' }
  }

  // 3. Validate input
  const parsed = notifyEngineerSchema.safeParse(input)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || '輸入資料格式錯誤'
    return { success: false, error: firstError }
  }

  const { recipientEmail, issueIds, message } = parsed.data

  // 4. Fetch selected issues
  const { data: issues, error: fetchError } = await supabase
    .from('issues')
    .select('id, issue_number, title, category, status, priority')
    .in('id', issueIds)
    .order('issue_number', { ascending: true })

  if (fetchError || !issues || issues.length === 0) {
    return { success: false, error: '無法取得項目資料' }
  }

  // 5. Build and send email
  const html = buildEmailHtml(issues as IssueRow[], message)
  const subject = `[nuvaClub 開發區] 你有 ${issues.length} 個項目需要關注`

  try {
    const { error: sendError } = await getResend().emails.send({
      from: EMAIL_FROM,
      to: recipientEmail,
      subject,
      html,
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return { success: false, error: `郵件發送失敗：${sendError.message}` }
    }
  } catch (err) {
    console.error('Email send error:', err)
    const message = err instanceof Error ? err.message : '未知錯誤'
    return { success: false, error: `郵件發送失敗：${message}` }
  }

  return { success: true }
}
