import { getRaceStaticParams } from '@/lib/staticParams';

export async function generateStaticParams() {
  return getRaceStaticParams('f1');
}

export default function F1RaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
