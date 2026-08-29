import { useState, useEffect } from "react";
import { publicNoticesApi, NoticeDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, AlertTriangle, Info, Loader2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const NoticesSection = () => {
  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<NoticeDto | null>(null);
  const [showAllNotices, setShowAllNotices] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const data = await publicNoticesApi.list();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
    setIsLoading(false);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "important":
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20";
      case "important":
        return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      default:
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "important":
        return "Importante";
      default:
        return "Normal";
    }
  };

  const displayedNotices = showAllNotices ? notices : notices.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Avisos Recentes
            {notices.length > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {notices.length} {notices.length === 1 ? "aviso" : "avisos"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aviso disponível no momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer hover:shadow-md transition-all",
                    getPriorityStyles(notice.priority)
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getPriorityIcon(notice.priority)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {notice.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notice.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(notice.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notices.length > 3 && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowAllNotices(!showAllNotices)}
            >
              {showAllNotices ? "Ver menos" : `Ver todos os ${notices.length} avisos`}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityIcon(selectedNotice.priority)}
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    selectedNotice.priority === "urgent" 
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : selectedNotice.priority === "important"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {getPriorityLabel(selectedNotice.priority)}
                  </span>
                </div>
                <DialogTitle className="text-xl">{selectedNotice.title}</DialogTitle>
                <DialogDescription>
                  Publicado em {format(new Date(selectedNotice.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedNotice.content}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoticesSection;
