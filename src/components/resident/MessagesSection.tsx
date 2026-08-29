import { useEffect, useState } from "react";
import { messagesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import ChatWindow from "@/components/messaging/ChatWindow";
import { useAuth } from "@/hooks/useAuth";

const MessagesSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const { admin_id } = await messagesApi.peerAdmin();
      setAdminId(admin_id != null ? String(admin_id) : null);
    } catch (e) {
      console.error(e);
      setAdminId(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminId || !user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-2" />
          <p>Nenhum administrador disponível no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Mensagens
        </CardTitle>
        <CardDescription>Comunicação direta com a administração do condomínio</CardDescription>
      </CardHeader>
      <CardContent>
        <ChatWindow
          currentUserId={user.id}
          peerUserId={adminId}
          peerName="Administração"
          isAdmin={false}
          height="65vh"
        />
      </CardContent>
    </Card>
  );
};

export default MessagesSection;
