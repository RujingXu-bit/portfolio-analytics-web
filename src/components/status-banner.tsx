import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Tone = "info" | "warning" | "success" | "error";

const toneStyles: Record<Tone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-red-200 bg-red-50 text-red-950",
};

export function StatusBanner({
  children,
  tone = "info",
  title,
}: {
  children: React.ReactNode;
  tone?: Tone;
  title?: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle;
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm ${toneStyles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1 leading-6 opacity-90" : "leading-6"}>{children}</div>
      </div>
    </div>
  );
}
