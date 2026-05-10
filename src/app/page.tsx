export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      {/* Hero */}
      <div className="max-w-2xl text-center space-y-6">
        <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">
          AI Coach CoPilot
        </p>

        <h1 className="text-5xl font-bold leading-tight">
          Coach smarter.<br />
          <span className="text-emerald-400">Not harder.</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-md mx-auto">
          Your athletes submit a check-in. You get a full AI analysis — progress,
          recovery, nutrition, adjustments — in seconds.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="/dashboard"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Log In
          </a>
        </div>
      </div>

      {/* Value props */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full text-center">
        {[
          { label: "Check-in time", before: "30 min", after: "5 min" },
          { label: "Analysis depth", before: "Manual notes", after: "AI structured" },
          { label: "Coach capacity", before: "10 athletes", after: "50+ athletes" },
        ].map((item) => (
          <div key={item.label} className="bg-zinc-900 rounded-2xl p-6 space-y-2">
            <p className="text-zinc-500 text-sm">{item.label}</p>
            <p className="text-zinc-400 line-through text-sm">{item.before}</p>
            <p className="text-emerald-400 font-bold text-xl">{item.after}</p>
          </div>
        ))}
      </div>

    </main>
  );
}
