import { getRaceStaticParams } from '@/lib/staticParams';

export async function generateStaticParams() {
  return getRaceStaticParams('motogp');
}

export default function MotoGPRaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
