import { cn } from "@/lib/utils";
import type { Status } from "@/lib/attendance";

const styles: Record<Status, string> = {
  safe: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning-foreground border-warning/30",
  shortage: "bg-danger-muted text-danger border-danger/20",
};

const labels: Record<Status, string> = {
  safe: "Safe",
  warning: "Warning",
  shortage: "Shortage",
};

export const StatusBadge = ({ status, className }: { status: Status; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
      styles[status],
      className,
    )}
  >
    <span className={cn(
      "h-1.5 w-1.5 rounded-full",
      status === "safe" && "bg-success",
      status === "warning" && "bg-warning",
      status === "shortage" && "bg-danger",
    )} />
    {labels[status]}
  </span>
);
