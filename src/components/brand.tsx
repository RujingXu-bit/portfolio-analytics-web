import Link from "next/link";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-3" href="/" aria-label="Portfolio Analytics home">
      <span
        aria-hidden="true"
        className={`grid size-9 place-items-center rounded-lg border text-sm font-bold ${
          inverse
            ? "border-white/20 bg-white/10 text-emerald-300"
            : "border-slate-200 bg-white text-emerald-700 shadow-sm"
        }`}
      >
        PA
      </span>
      <span className={inverse ? "font-semibold text-white" : "font-semibold text-slate-950"}>
        Portfolio Analytics
      </span>
    </Link>
  );
}
