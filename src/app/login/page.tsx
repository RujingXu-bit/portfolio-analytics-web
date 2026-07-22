import Link from "next/link";

export default function LoginFoundationPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Secure session boundary ready
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
        Sign-in UI is being assembled.
      </h1>
      <p className="mt-5 leading-7 text-slate-600">
        Authentication already runs through same-origin Route Handlers. The
        access token remains in an HttpOnly cookie and is never returned to
        browser JavaScript.
      </p>
      <Link className="mt-8 font-semibold text-slate-900 underline" href="/">
        Return home
      </Link>
    </main>
  );
}
