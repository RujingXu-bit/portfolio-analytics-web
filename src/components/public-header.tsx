import Link from "next/link";

import { Brand } from "@/components/brand";

export function PublicHeader({ inverse = false }: { inverse?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Brand inverse={inverse} />
      <nav aria-label="Primary navigation" className="flex items-center gap-2 sm:gap-4">
        <Link
          className={`hidden px-3 py-2 text-sm font-medium sm:inline-flex ${inverse ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"}`}
          href="/demo"
        >
          Offline demo
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${inverse ? "border border-white/20 text-white hover:bg-white/10" : "border border-slate-300 bg-white text-slate-800 hover:border-slate-500"}`}
          href="/login"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
