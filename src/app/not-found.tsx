import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-6">🏁</p>
        <h1 className="font-display font-black text-4xl text-white uppercase-heading mb-4">404</h1>
        <p className="text-[var(--text-secondary)] mb-8">This page doesn&apos;t exist on our circuit.</p>
        <Link href="/" className="inline-block px-6 py-3 rounded-full bg-[var(--accent-f1)] text-white font-bold hover:opacity-90 transition-opacity">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
