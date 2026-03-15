'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-6">⚠️</p>
        <h2 className="font-display font-black text-3xl text-white mb-4">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-[var(--accent-teal)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
