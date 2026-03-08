export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          You&apos;re offline
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          ScoreMyPrompt needs an internet connection to analyze your prompts. Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary font-semibold"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
