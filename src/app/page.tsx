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
        <div className="max-w-3xl mx-auto text-center space-y-12">

          {/* Headline */}
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-6xl font-bold leading-tight">
              Structured feedback in minutes, not hours.
            </h2>

            <p className="text-xl text-zinc-400 leading-relaxed">
              Athletes submit their check-in. You receive comprehensive feedback on progress, recovery, and nutrition. Ready to review and act on.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <p className="text-zinc-300 font-medium">Review 10+ athletes daily in under an hour</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <p className="text-zinc-300 font-medium">Consistent feedback framework every time</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <p className="text-zinc-300 font-medium">Never miss critical details from your athletes</p>
            </div>
          </div>

          {/* CTA */}
          <a
            href="/dashboard"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
          >
            Start Coaching
          </a>
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
