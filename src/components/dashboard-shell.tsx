"use client";

import { Code2, FlaskConical, LayoutDashboard, LoaderCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Brand } from "@/components/brand";
import type { SafeSession } from "@/lib/api/types";
import { apiRequest } from "@/lib/client/api-client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<SafeSession>("/api/session")
      .then((session) => {
        if (!active) return;
        if (!session.authenticated) router.replace("/login");
        else setReady(true);
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  if (!ready) {
    return <main className="grid min-h-screen place-items-center bg-[#f4f7f9]"><div className="flex items-center gap-3 text-sm font-medium text-slate-600"><LoaderCircle aria-hidden="true" className="size-5 animate-spin text-emerald-700" />Checking secure session</div></main>;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <nav aria-label="Workspace navigation" className="hidden items-center gap-1 md:flex">
            <Link aria-current={pathname.startsWith("/portfolios") ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${pathname.startsWith("/portfolios") ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:text-slate-950"}`} href="/portfolios"><LayoutDashboard aria-hidden="true" className="size-4" />Portfolios</Link>
            <Link className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950" href="/demo"><FlaskConical aria-hidden="true" className="size-4" />Offline demo</Link>
            <a className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950" href="https://github.com/RujingXu-bit/Ledger-Lens-web"><Code2 aria-hidden="true" className="size-4" />Source</a>
          </nav>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-60" disabled={signingOut} onClick={signOut} type="button">{signingOut ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <LogOut aria-hidden="true" className="size-4" />}<span className="hidden sm:inline">Sign out</span></button>
        </div>
      </header>
      <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-xs leading-5 text-amber-950 sm:px-8">Demo environment · use synthetic data only · records may be reset</div>
      {children}
    </div>
  );
}
