import { DashboardClient } from './DashboardClient'

interface PageProps {
  searchParams: Promise<{ submitted?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  return <DashboardClient submitted={!!params.submitted} />
}
