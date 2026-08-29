import { useState } from "react";
import { PaymentStatus } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PaymentStatus;
  onStatusChange?: (status: PaymentStatus) => void;
}

const statusConfig: Record<PaymentStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  em_dia: {
    label: "Em Dia",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  pendente: {
    label: "Pendente",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
  },
  em_atraso: {
    label: "Em Atraso",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  arquivado: {
    label: "Arquivado",
    dot: "bg-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
  },
};

const allStatuses: PaymentStatus[] = ["em_dia", "pendente", "em_atraso", "arquivado"];

const StatusBadge = ({ status, onStatusChange }: StatusBadgeProps) => {
  const [open, setOpen] = useState(false);
  const config = statusConfig[status];

  const trigger = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
        onStatusChange && "cursor-pointer hover:shadow-sm",
        config.bg, config.text, config.border
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );

  if (!onStatusChange) return trigger;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><button>{trigger}</button></PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {allStatuses.map((s) => {
          const c = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => { onStatusChange(s); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors hover:bg-muted",
                s === status && "bg-muted font-semibold"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", c.dot)} />
              <span className={c.text}>{c.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default StatusBadge;
