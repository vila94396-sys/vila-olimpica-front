import { useState, useEffect } from "react";
import { documentsApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileText, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentStats {
  id: number;
  title: string;
  category: string;
  folder: string | null;
  download_count: number;
}

interface DailyDownload {
  date: string;
  downloads: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DocumentDownloadsStats = () => {
  const [documentStats, setDocumentStats] = useState<DocumentStats[]>([]);
  const [dailyDownloads, setDailyDownloads] = useState<DailyDownload[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);

    let downloads;
    try {
      downloads = await documentsApi.downloads();
    } catch (error) {
      console.error("Error fetching download stats:", error);
      setIsLoading(false);
      return;
    }

    // Calculate total downloads
    setTotalDownloads(downloads.length);

    // Group by document
    const docMap = new Map<number, DocumentStats>();
    downloads.forEach((d) => {
      if (d.document) {
        const docId = d.document_id;
        if (docMap.has(docId)) {
          docMap.get(docId)!.download_count++;
        } else {
          docMap.set(docId, {
            id: docId,
            title: d.document.title,
            category: d.document.category,
            folder: d.document.folder,
            download_count: 1,
          });
        }
      }
    });

    // Sort by download count
    const sortedDocs = Array.from(docMap.values()).sort(
      (a, b) => b.download_count - a.download_count
    );
    setDocumentStats(sortedDocs);

    // Calculate daily downloads for last 7 days
    const last7Days: DailyDownload[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const dayDownloads = downloads.filter((d) => {
        const downloadDate = new Date(d.downloaded_at);
        return downloadDate >= dayStart && downloadDate <= dayEnd;
      }).length;

      last7Days.push({
        date: format(day, "EEE", { locale: ptBR }),
        downloads: dayDownloads,
      });
    }
    setDailyDownloads(last7Days);

    setIsLoading(false);
  };

  // Prepare pie chart data by category
  const categoryData = documentStats.reduce((acc: { name: string; value: number }[], doc) => {
    const existing = acc.find((item) => item.name === doc.category);
    if (existing) {
      existing.value += doc.download_count;
    } else {
      acc.push({ name: doc.category, value: doc.download_count });
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Total de Downloads
            </CardDescription>
            <CardTitle className="text-3xl">{totalDownloads}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Em todos os documentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos com Downloads
            </CardDescription>
            <CardTitle className="text-3xl">{documentStats.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documentos baixados pelo menos uma vez
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Média por Documento
            </CardDescription>
            <CardTitle className="text-3xl">
              {documentStats.length > 0 
                ? (totalDownloads / documentStats.length).toFixed(1) 
                : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Downloads por documento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Downloads Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Downloads - Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyDownloads.some(d => d.downloads > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyDownloads}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <Download className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum download nos últimos 7 dias</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Downloads by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Downloads por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <FileText className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum download registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Mais Baixados</CardTitle>
          <CardDescription>Ranking dos documentos com mais downloads</CardDescription>
        </CardHeader>
        <CardContent>
          {documentStats.length > 0 ? (
            <div className="space-y-3">
              {documentStats.slice(0, 10).map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs text-muted-foreground">
                        {doc.category}
                      </span>
                      {doc.folder && (
                        <span className="px-2 py-0.5 bg-primary/10 rounded text-xs text-primary">
                          {doc.folder}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Download className="w-4 h-4" />
                    {doc.download_count}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum download registrado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentDownloadsStats;
