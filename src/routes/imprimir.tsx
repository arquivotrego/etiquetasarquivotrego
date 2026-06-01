import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Printer, ArrowLeft } from "lucide-react";

type Mode = "single" | "double";
type Search = { ids?: string; mode?: Mode };

export const Route = createFileRoute("/imprimir")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ids: typeof s.ids === "string" ? s.ids : undefined,
    mode: s.mode === "single" ? "single" : "double",
  }),
  head: () => ({ meta: [{ title: "Imprimir Etiquetas — TRE-GO" }] }),
  component: ImprimirPage,
});

function ImprimirPage() {
  const navigate = useNavigate();
  const { ids, mode = "double" } = Route.useSearch();
  const idList: string[] = (ids ?? "").split(",").filter(Boolean);
  const maxN = mode === "single" ? 1 : 2;
  const etiquetas = idList
    .slice(0, maxN)
    .map((id) => etiquetasStore.get(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [mode, ids]);

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

  const setMode = (m: Mode) =>
    navigate({ to: "/imprimir", search: { ids, mode: m } });

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={() => navigate({ to: "/historico" })}
          className="h-10 px-3 rounded-xl glass-input text-sm inline-flex items-center gap-2 hover:bg-white/80"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Layout:</span>
          <button
            onClick={() => setMode("double")}
            className={`h-9 px-3 rounded-lg text-xs font-medium transition ${
              mode === "double"
                ? "bg-primary text-primary-foreground shadow"
                : "glass-input hover:bg-white/80"
            }`}
          >
            2 por folha (A4 paisagem)
          </button>
          <button
            onClick={() => setMode("single")}
            className={`h-9 px-3 rounded-lg text-xs font-medium transition ${
              mode === "single"
                ? "bg-primary text-primary-foreground shadow"
                : "glass-input hover:bg-white/80"
            }`}
          >
            1 por folha (A4 retrato)
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 shadow-md hover:opacity-90"
        >
          <Printer className="h-4 w-4" /> Imprimir
        </button>
      </div>

      <div
        className={`print-area ${
          mode === "single" ? "print-single" : "print-double"
        } glass rounded-2xl p-6 flex flex-wrap justify-center items-center gap-6`}
      >
        {etiquetas.map((e) => (
          <Etiqueta key={e.id} data={e} />
        ))}
      </div>
    </div>
  );
}
