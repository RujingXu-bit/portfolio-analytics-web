"use client";

import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { apiRequest, jsonBody, userFacingError } from "@/lib/client/api-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (registering && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest(`/api/auth/${registering ? "register" : "login"}`, {
        method: "POST",
        ...jsonBody({ email, password }),
      });
      router.replace("/portfolios");
      router.refresh();
    } catch (requestError) {
      setError(userFacingError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9">
      <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><LockKeyhole aria-hidden="true" className="size-5" /></div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">{registering ? "Create a demo account" : "Sign in"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{registering ? "Registration signs you in automatically." : "Return to your private portfolio workspace."}</p>

      {registering ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          Demonstration only. Do not enter real financial, account, or sensitive information. Demo data may be reset.
        </div>
      ) : null}

      <form className="mt-7 space-y-5" onSubmit={submit}>
        <div>
          <label className="text-sm font-semibold text-slate-800" htmlFor={`${mode}-email`}>Email address</label>
          <input autoComplete="email" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm placeholder:text-slate-400 hover:border-slate-400" id={`${mode}-email`} name="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800" htmlFor={`${mode}-password`}>Password</label>
          <input autoComplete={registering ? "new-password" : "current-password"} className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm hover:border-slate-400" id={`${mode}-password`} minLength={registering ? 12 : 1} name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          {registering ? <p className="mt-2 text-xs text-slate-500">Use at least 12 characters.</p> : null}
        </div>
        {registering ? (
          <div>
            <label className="text-sm font-semibold text-slate-800" htmlFor="register-confirmation">Confirm password</label>
            <input autoComplete="new-password" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-950 shadow-sm hover:border-slate-400" id="register-confirmation" minLength={12} name="confirmation" onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
          </div>
        ) : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p> : null}
        <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
          {submitting ? "Please wait" : registering ? "Create account" : "Sign in"}
          {!submitting ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {registering ? "Already have an account?" : "New to the demo?"}{" "}
        <Link className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4" href={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create one"}</Link>
      </p>
    </section>
  );
}
