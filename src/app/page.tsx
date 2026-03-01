import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid noise-overlay relative">
      {/* Radial glow */}
      <div className="glow-top absolute inset-0 pointer-events-none" />

      {/* Hero — left aligned */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
        <div className="animate-fade-in max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 text-xs font-mono tracking-wide mb-8 border border-zinc-200 dark:border-zinc-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow" />
            v1.0 — Next.js + Prisma + Neon
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.1]">
            Measure the Web.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
            A developer-first observability tool. Scrape, inspect, and monitor HTTP requests — every response tells a story.
          </p>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 mt-8 sm:mt-10">
            <Link
              href="/auth/register"
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors duration-200 shadow-sm shadow-indigo-600/20 text-center"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-colors duration-200 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16 sm:mt-24 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "Headless Scraping",
              desc: "Puppeteer-powered extraction of titles, headings, meta, and body text from any URL.",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Request Telemetry",
              desc: "Real-time dashboard with status tracking, response times, and request history.",
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Authenticated Workspace",
              desc: "Private, per-user workspace with JWT auth. Your data stays yours.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-5 text-left hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 pb-8 text-xs text-zinc-400 dark:text-zinc-600 font-mono">
        WebScope — Every request tells a story.
      </footer>
    </div>
  );
}
