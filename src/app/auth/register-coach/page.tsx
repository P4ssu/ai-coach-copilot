import { RegisterCoachClient } from './RegisterCoachClient'

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function RegisterCoachPage({ searchParams }: PageProps) {
  const params = await searchParams
  return <RegisterCoachClient token={params.token ?? null} email={params.email ?? null} />
}
