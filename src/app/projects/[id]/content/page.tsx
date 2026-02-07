import { notFound } from 'next/navigation'
import { getProject } from '@/app/actions/projects'
import { readSection } from '@/lib/content'
import { COURSE_TOC, findSection, getAdjacentSections } from '@/content/course/_config'
import { ContentViewer } from './ContentViewer'

interface ContentPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ch?: string; s?: string }>
}

export default async function ContentPage({ params, searchParams }: ContentPageProps) {
  const { id } = await params
  const { ch = 'ch1', s = '1.0' } = await searchParams

  const project = await getProject(id)
  if (!project) notFound()

  const found = findSection(ch, s)
  if (!found) notFound()

  const markdown = readSection(ch, s)
  if (!markdown) notFound()

  const { prev, next } = getAdjacentSections(ch, s)

  return (
    <ContentViewer
      projectId={id}
      projectTitle={project.title}
      toc={COURSE_TOC}
      currentChapter={ch}
      currentSection={s}
      chapterTitle={`Ch${found.chapter.number} ${found.chapter.title}`}
      sectionTitle={`${found.section.id} ${found.section.title}`}
      markdownContent={markdown}
      prev={prev}
      next={next}
    />
  )
}
