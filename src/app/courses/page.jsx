import CoursesClient from './CoursesClient'

export const metadata = {
  title: 'Courses',
  description: 'Short courses from ECWA teachers and theologians to deepen your understanding of scripture.',
}

export default function CoursesPage() {
  return <CoursesClient />
}
