import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-32 text-center">
        <div className="animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by Next.js, Prisma & Neon
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            Analyze Any Website
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Scrape titles, headings, and metadata from any URL. Track every request with real-time dashboards and detailed analytics.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Analyzing
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg hover:bg-white dark:hover:bg-white/20 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-24 animate-fadeIn" style={{ animationDelay: "200ms" }}>
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "Smart Scraping",
              desc: "Extract titles, H2 headings, and meta descriptions from any website instantly.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Live Analytics",
              desc: "Real-time stats dashboard with response times, success rates, and request history.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Secure & Personal",
              desc: "Your own authenticated workspace. All data is private and tied to your account.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 shadow-lg p-6 text-left hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8 text-sm text-gray-400 dark:text-gray-500">
        WebScope Pro — Built with Next.js, Prisma & Neon PostgreSQL
      </footer>
    </div>
  );
}
