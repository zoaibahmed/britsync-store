import { redirect } from 'next/navigation';

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
  const role = searchParams?.role || 'maker';
  redirect(`/login?tab=register&role=${role}`);
}
