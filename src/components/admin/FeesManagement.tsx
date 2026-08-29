import { useState } from "react";
import DataGrid from "./fees/DataGrid";
import FpdDataGrid from "./fees/FpdDataGrid";
import InstitutionsGrid from "./fees/InstitutionsGrid";
import SaldoAuditDialog from "./fees/SaldoAuditDialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type System = "ffh" | "fdp" | "instituicoes";

const FeesManagement = () => {
  const [activeSystem, setActiveSystem] = useState<System>("ffh");
  const [auditOpen, setAuditOpen] = useState(false);

  const tabs: { key: System; label: string }[] = [
    { key: "ffh", label: "Taxa de Condomínio FFH" },
    { key: "fdp", label: "Taxa de Condomínio FPD" },
    { key: "instituicoes", label: "Instituições" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveSystem(t.key)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeSystem === t.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeSystem === "ffh" && (
          <Button variant="outline" size="sm" onClick={() => setAuditOpen(true)}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Auditar Saldos
          </Button>
        )}
      </div>

      {activeSystem === "ffh" && <DataGrid />}
      {activeSystem === "fdp" && <FpdDataGrid />}
      {activeSystem === "instituicoes" && <InstitutionsGrid />}

      <SaldoAuditDialog open={auditOpen} onOpenChange={setAuditOpen} />
    </div>
  );
};

export default FeesManagement;
