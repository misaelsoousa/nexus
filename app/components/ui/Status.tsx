import type { StatusProps } from "@/types/Status";

export default function Status({ status }: StatusProps) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted">
      <span className={`size-2 rounded-full ${status.color}`} />
      {status.name}
    </span>
  );
}
