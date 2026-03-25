'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#06060A] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-6">⚠️</p>
          <h1 className="font-display font-black text-3xl mb-4">Something went wrong</h1>
          <p className="text-white/70 mb-8">{error?.message || 'Unexpected error.'}</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-white text-black font-bold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
