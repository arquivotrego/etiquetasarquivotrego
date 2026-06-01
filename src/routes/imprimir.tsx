import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Printer, ArrowLeft } from "lucide-react";

type Search = { ids?: string };

export const Route = createFileRoute("/imprimir")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ids: typeof s.ids === "string" ? s.ids : undefined,
  }),
  head: () => ({ meta: [{ title: "Imprimir Etiquetas — TRE-GO" }] }),
  component: ImprimirPage,
});

function ImprimirPage() {
  const navigate = useNavigate();
  const { ids } = Route.useSearch();
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 2);
  const etiquetas = idList.map((id) => etiquetasStore.get(id)).filter(Boolean);

  useEffect(() => {
    // auto-trigger print dialog shortly after mount
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, []);

  if (etiquetas.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma etiqueta selecionada.</p>
        <button
          onClick={() => navigate({ to: "/historico" })}
          className="mt-4 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm"
        >
          Voltar ao histórico
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 flex items-center justify-between no-print">
        <button
          onClick={() => navigate({ to: "/historico" })}
          className="h-10 px-3 rounded-xl glass-input text-sm inline-flex items-center gap-2 hover:bg-white/80"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h2 className="text-sm font-medium">Pré-visualização de impressão (A4 paisagem)</h2>
        <button
          onClick={() => window.print()}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 shadow-md hover:opacity-90"
        >
          <Printer className="h-4 w-4" /> Imprimir
        </button>
      </div>

      <div className="print-area glass rounded-2xl p-6 flex flex-wrap justify-around gap-6">
        {etiquetas.map((e) => (
          <Etiqueta key={e!.id} data={e!} />
        ))}
      </div>
    </div>
  );
}
