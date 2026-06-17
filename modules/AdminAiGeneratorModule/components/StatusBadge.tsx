import { Badge } from "@/components/ui/badge";
import { StatusBadgeProps } from "../interface";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  QUEUED: "bg-blue-50 text-blue-700 border-blue-200",
  RUNNING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  REGENERATING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-neutral-100 text-neutral-700 border-neutral-200",
  PUBLISHED: "bg-violet-50 text-violet-700 border-violet-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusStyles[status] || ""}>
      {status}
    </Badge>
  );
}
