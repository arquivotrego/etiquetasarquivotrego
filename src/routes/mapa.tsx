import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MAPA_CORREDORES } from "@/lib/mapa-caixas";
import { etiquetasStore, type Etiqueta as EtiquetaT } from "@/lib/storage";
import { Search } from "lucide-react";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de Organização de Caixas — SEDOC" },
      { name: "description", content: "Mapa dos corredores e estantes do arquivo com as vagas já etiquetadas." },
      { property: "og:title", content: "Mapa de Organização de Caixas — SEDOC" },
      { property: "og:description", content: "Mapa dos corredores e estantes do arquivo com as vagas já etiquetadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const navigate = useNavigate();
  const [etiquetas, setEtiquetas] = useState<EtiquetaT[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => setEtiquetas(etiquetasStore.list());
    refresh();
    window.addEventListener("tre-storage", refresh);
    return () => window.removeEventListener("tre-storage", refresh);
  }, []);

  const porVaga = useMemo(() => {
    const m = new Map<number, EtiquetaT>();
    for (const e of etiquetas) {
      const n = parseInt(e.vaga, 10);
      if (!isNaN(n) && !m.has(n)) m.set(n, e);
    }
    return m;
  }, [etiquetas]);

  const alvo = parseInt(q.trim(), 10);
  const corredores = useMemo(() => {
    if (isNaN(alvo)) return MAPA_CORREDORES;
    return MAPA_CORREDORES.filter((c) =>
      c.estantes.some((e) => alvo >= e.start && alvo < e.start + e.rows * e.cols),
    );
  }, [alvo]);

  function abrirVaga(n: number) {
    const et = porVaga.get(n);
    if (!et) return;
    navigate({ to: "/historico", search: { tipo: et.tipo ?? "permanente", sel: et.id } });
  }

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold tracking-tight">MAPA DE ORGANIZAÇÃO DE CAIXAS</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cada bloco é uma estante. Vagas com <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" /> já
          possuem etiqueta — clique para abrir no histórico já selecionada para impressão.
        </p>
      </header>

      <div className="glass-strong rounded-2xl p-3 flex items-center gap-2">
        <Search className="h-4 w-4 ml-2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          inputMode="numeric"
          placeholder="Localizar número da vaga…"
          className="flex-1 h-10 px-2 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="space-y-4">
        {corredores.map((c) => (
          <section key={c.corredor} className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">CORREDOR {c.corredor}</h3>
            <div className="flex gap-4 flex-wrap">
              {c.estantes.map((est) => (
                <div key={est.start} className="glass-strong rounded-xl p-2">
                  <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${est.cols}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: est.rows * est.cols }, (_, i) => est.start + i).map((n) => {
                      const ocupada = porVaga.has(n);
                      const destaque = n === alvo;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => abrirVaga(n)}
                          disabled={!ocupada}
                          title={ocupada ? `Vaga ${n} — abrir no histórico` : `Vaga ${n} — livre`}
                          className={[
                            "relative h-9 w-12 rounded-lg text-[11px] font-medium tabular-nums transition",
                            ocupada
                              ? "bg-primary/15 text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"
                              : "bg-white/40 dark:bg-white/5 text-muted-foreground cursor-default",
                            destaque ? "ring-2 ring-primary" : "",
                          ].join(" ")}
                        >
                          {n}
                          {ocupada && (
                            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {corredores.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
            Nenhuma vaga encontrada com esse número.
          </div>
        )}
      </div>
    </div>
  );
}
