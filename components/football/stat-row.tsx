export function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-3 last:border-b-0">
      <span className="text-sm text-secondary">{label}</span>
      <span className="font-data text-sm tabular-nums text-primary">{value}</span>
    </div>
  );
}
