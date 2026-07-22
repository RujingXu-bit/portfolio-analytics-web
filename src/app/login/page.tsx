import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      <div className="border-b border-slate-200 bg-white"><PublicHeader /></div>
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10 lg:py-24">
        <div className="hidden lg:block">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Secure demo access</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950">Continue your analysis workspace.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-slate-600">Your access token stays inside an HttpOnly session cookie. Browser JavaScript never receives or stores it.</p>
        </div>
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
