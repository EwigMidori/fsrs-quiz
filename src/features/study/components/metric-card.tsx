export function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.25rem] border border-[color:var(--hairline)] bg-white/70 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.26em] text-[color:var(--muted)]">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-light text-[color:var(--ink)]">
        {value}
      </div>
    </div>
  )
}
