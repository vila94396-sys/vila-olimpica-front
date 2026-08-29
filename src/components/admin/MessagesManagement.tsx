import { useEffect, useMemo, useState } from "react";
import { messagesApi, residentsApi, type ResidentDto } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Search } from "lucide-react";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ResidentEntry extends ResidentDto {
  lastMessageAt?: string;
  unread?: number;
}

const MessagesManagement = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<ResidentEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ResidentEntry | null>(null);

  useEffect(() => {
    fetchResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const [activeResidents, conversations] = await Promise.all([
        residentsApi.list(),
        messagesApi.conversations(),
      ]);

      const lastBy = new Map(conversations.map((c) => [c.user_id, c.last_message_at]));
      const unreadBy = new Map(conversations.map((c) => [c.user_id, c.unread]));

      const list = activeResidents
        .filter((r) => r.status === "approved")
        .map((r) => ({
          ...r,
          lastMessageAt: lastBy.get(r.id),
          unread: unreadBy.get(r.id) || 0,
        }));

      // Sort: unread first, then last message desc, then name
      list.sort((a, b) => {
        if ((b.unread || 0) !== (a.unread || 0)) return (b.unread || 0) - (a.unread || 0);
        if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        return (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "");
      });
      setResidents(list);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[\s-]+/g, "");
    const q = norm(search);
    if (!q) return residents;
    return residents.filter((r) => {
      const idFmt =
        r.block && r.building && r.apartment ? `${r.block}-${r.building}-${r.apartment}` : r.apartment ? `apt${r.apartment}` : "";
      const haystack = norm(
        [r.full_name, r.email, idFmt, r.block, r.building, r.apartment].filter(Boolean).join(" ")
      );
      return haystack.includes(q);
    });
  }, [residents, search]);

  if (!session) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[70vh]">
          {/* Sidebar */}
          <div className="border-r border-border flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Procurar por nome ou ID (ex: 1-2-3)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center p-6">Nenhum morador encontrado.</p>
              ) : (
                filtered.map((r) => {
                  const id =
                    r.block && r.building && r.apartment
                      ? `${r.block}-${r.building}-${r.apartment}`
                      : r.apartment
                      ? `Apt ${r.apartment}`
                      : "—";
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className={cn(
                        "w-full text-left px-3 py-3 border-b hover:bg-muted/50 transition-colors flex items-center justify-between gap-2",
                        selected?.id === r.id && "bg-muted"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.full_name || r.email || "Morador"}</p>
                        <p className="text-xs text-muted-foreground truncate">{id} · {r.email}</p>
                      </div>
                      {(r.unread || 0) > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {r.unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="md:col-span-2 p-3">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>Selecione um morador para iniciar a conversa</p>
              </div>
            ) : (
              <ChatWindow
                currentUserId={user!.id}
                peerUserId={String(selected.id)}
                peerName={selected.full_name || selected.email || "Morador"}
                isAdmin={true}
                height="70vh"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesManagement;
