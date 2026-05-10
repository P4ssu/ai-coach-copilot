import { VerifyEmailClient } from './VerifyEmailClient'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailChangePage({ searchParams }: PageProps) {
  const params = await searchParams
  return <VerifyEmailClient token={params.token ?? null} />
}
