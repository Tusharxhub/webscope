interface StatusChipProps {
  value: string;
  className?: string;
}

export default function StatusChip({ value, className = "" }: StatusChipProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-medium tracking-wide ${className}`}>
      {value}
    </span>
  );
}
