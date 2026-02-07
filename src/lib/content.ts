import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'course')

export function readSection(chapterDir: string, sectionId: string): string | null {
  const filePath = path.join(CONTENT_DIR, chapterDir, `${sectionId}.md`)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}
