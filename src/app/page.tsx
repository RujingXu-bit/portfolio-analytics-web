import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20 sm:px-10">
      <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Portfolio Analytics
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
        Explainable portfolio risk, built on deterministic metrics.
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
        The independent web client is now connected through a secure BFF
        boundary. The complete interactive dashboard arrives in the next
        release task.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          href="/login"
        >
          Sign in
        </Link>
        <a
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
          href="https://github.com/RujingXu-bit/portfolio-analytics-api"
        >
          View backend
        </a>
      </div>
    </main>
  );
}
