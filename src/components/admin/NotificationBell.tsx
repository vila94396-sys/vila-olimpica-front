import { useEffect, useState } from "react";
import { Bell, UserPlus, Calendar, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  onNavigate: (section: string) => void;
}

interface Counts {
  accessRequests: number;
  reservations: number;
  services: number;
}

const NotificationBell = ({ onNavigate }: NotificationBellProps) => {
  const [counts, setCounts] = useState<Counts>({
    accessRequests: 0,
    reservations: 0,
    services: 0,
  });
  const [open, setOpen] = useState(false);

  const fetchCounts = async () => {
    const [accessRes, resvRes, svcRes] = await Promise.all([
      supabase
        .from("access_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("marketplace_services")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    setCounts({
      accessRequests: accessRes.count || 0,
      reservations: resvRes.count || 0,
      services: svcRes.count || 0,
    });
  };

  useEffect(() => {
    fetchCounts();

    // Realtime subscriptions
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "access_requests" },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "marketplace_services" },
        () => fetchCounts()
      )
      .subscribe();

    // Polling fallback every 60s
    const interval = setInterval(fetchCounts, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const total = counts.accessRequests + counts.reservations + counts.services;

  const items = [
    {
      icon: UserPlus,
      label: "Pedidos de acesso pendentes",
      count: counts.accessRequests,
      section: "access-requests",
    },
    {
      icon: Calendar,
      label: "Reservas pendentes",
      count: counts.reservations,
      section: "reservations",
    },
    {
      icon: Store,
      label: "Serviços do marketplace pendentes",
      count: counts.services,
      section: "services",
    },
  ];

  const handleClick = (section: string) => {
    onNavigate(section);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {total > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1",
                "rounded-full bg-destructive text-destructive-foreground",
                "text-[10px] font-bold flex items-center justify-center"
              )}
            >
              {total > 99 ? "99+" : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "Nenhuma pendência"
              : `${total} item(s) requerem atenção`}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.section}
              onClick={() => handleClick(item.section)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left border-b border-border last:border-0"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.count === 0
                    ? "Sem pendências"
                    : `${item.count} pendente(s)`}
                </p>
              </div>
              {item.count > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
