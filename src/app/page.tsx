export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Vexlon</h1>
          <div className="flex gap-6">
            <a href="/login" className="text-zinc-400 hover:text-white transition-colors">
              Log In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: For Coaches */}
          <div className="space-y-8">
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                For Coaches
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Structured feedback in minutes, not hours.
              </h2>
            </div>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              Athletes submit their check-in. You receive comprehensive feedback on progress, recovery, and nutrition — ready to review and act on.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Review 10+ athletes daily in under an hour</span>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Consistent feedback framework every time</span>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Never miss critical details from your athletes</span>
              </div>
            </div>

            <a
              href="/dashboard"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-lg transition-colors mt-6"
            >
              Get Started as Coach
            </a>
          </div>

          {/* Right: For Athletes */}
          <div className="space-y-8 border-l border-zinc-800 pl-12">
            <div>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                For Athletes
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Get detailed coaching feedback you can act on.
              </h2>
            </div>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              Share your weekly check-in and receive personalized coaching feedback covering all aspects of your training and recovery.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Structured feedback every week</span>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Track your progress over time</span>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-zinc-300">Direct feedback from your coach</span>
              </div>
            </div>

            <a
              href="/auth/register"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-lg transition-colors mt-6"
            >
              Join as Athlete
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-zinc-800 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <p className="text-emerald-400 text-4xl font-bold mb-2">2 min</p>
              <p className="text-zinc-400">Athlete check-in time</p>
            </div>
            <div>
              <p className="text-emerald-400 text-4xl font-bold mb-2">5 min</p>
              <p className="text-zinc-400">Coach review & feedback</p>
            </div>
            <div>
              <p className="text-emerald-400 text-4xl font-bold mb-2">100%</p>
              <p className="text-zinc-400">Actionable insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-zinc-500 text-sm">
          <p>© 2026 Vexlon. Professional coaching platform.</p>
        </div>
      </footer>
    </div>
  );
}
