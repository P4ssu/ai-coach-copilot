import { RegisterClient } from './RegisterClient'

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams
  return <RegisterClient token={params.token ?? null} email={params.email ?? null} />
}
