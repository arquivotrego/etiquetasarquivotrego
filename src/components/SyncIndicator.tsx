import { useEffect, useState } from "react";
import { AlertTriangle, Check, CloudOff, Loader2, RefreshCw, Cloud } from "lucide-react";
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from "@/lib/storage";

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>({
    state: "idle",
    message: "Sincronizado",
    at: 0,
  });

  useEffect(() => {
    setStatus(getSyncStatus());
    return subscribeSyncStatus(() => setStatus(getSyncStatus()));
  }, []);

  const map = {
    idle: {
      icon: <Cloud className="h-4 w-4" />,
      text: "Sincronizado",
      cls: "text-muted-foreground",
    },
    saving: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: "Salvando…",
      cls: "text-primary",
    },
    saved: {
      icon: <Check className="h-4 w-4" />,
      text: "Salvo",
      cls: "text-emerald-500",
    },
    realtime: {
      icon: <RefreshCw className="h-4 w-4 animate-spin" />,
      text: "Atualizado",
      cls: "text-sky-400",
    },
    error: {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "Erro",
      cls: "text-destructive",
    },
  } as const;

  const view = map[status.state] ?? map.idle;

  return (
    <div
      role="status"
      aria-live="polite"
      title={status.message}
      className={`h-10 px-3 rounded-xl glass-input hidden sm:inline-flex items-center gap-2 text-xs font-medium ${view.cls}`}
    >
      {status.state === "error" ? <CloudOff className="h-4 w-4" /> : view.icon}
      <span className="hidden lg:inline">{view.text}</span>
    </div>
  );
}
