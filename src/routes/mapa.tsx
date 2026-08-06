import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MAPA_CORREDORES } from "@/lib/mapa-caixas";
import { etiquetasStore, type Etiqueta as EtiquetaT } from "@/lib/storage";
import { Search, ScanLine, ChevronDown } from "lucide-react";

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

type Grupo = {
  key: string;
  sigla: string;
  nome: string;
  de: number;
  ate: number;
  /** Tipo de etiqueta que ocupa este grupo de corredores (null = nenhum). */
  tipo: EtiquetaT["tipo"] | null;
};

const GRUPOS: Grupo[] = [
  { key: "gp", sigla: "GP", nome: "GUARDA PERMANENTE", de: 1, ate: 5, tipo: "permanente" },
  { key: "gi", sigla: "GI", nome: "GUARDA INTERMEDIÁRIA", de: 6, ate: 12, tipo: "intermediaria" },
  { key: "jud", sigla: "JUD", nome: "JUDICIÁRIO", de: 13, ate: 30, tipo: null },
  { key: "h", sigla: "H", nome: "HISTÓRICO", de: 31, ate: 32, tipo: "historico" },
  { key: "sgp", sigla: "SGP", nome: "SGP", de: 33, ate: 52, tipo: "sgp" },
  { key: "outros", sigla: "OUTROS", nome: "DEMAIS CORREDORES", de: 53, ate: 999, tipo: null },
];


/** Corredores do grupo com as vagas renumeradas a partir de 0001 (esquerda→direita, cima→baixo). */
function corredoresDoGrupo(g: Grupo) {
  let n = 1;
  const corredores = MAPA_CORREDORES.filter((c) => c.corredor >= g.de && c.corredor <= g.ate).map(
    (c) => ({
      corredor: c.corredor,
      estantes: c.estantes.map((e) => {
        const inicio = n;
        n += e.rows * e.cols;
        return { ...e, inicio };
      }),
    }),
  );
  return { corredores, total: n - 1 };
}

const MAPA_GRUPOS = GRUPOS.map((g) => ({ ...g, ...corredoresDoGrupo(g) })).filter(
  (g) => g.corredores.length > 0,
);

function MapaPage() {
  const navigate = useNavigate();
  const [etiquetas, setEtiquetas] = useState<EtiquetaT[]>([]);
  const [q, setQ] = useState("");
  const [lote, setLote] = useState("");
  const [aberto, setAberto] = useState<string | null>(MAPA_GRUPOS[0]?.key ?? null);

  useEffect(() => {
    const refresh = () => setEtiquetas(etiquetasStore.list());
    refresh();
    window.addEventListener("tre-storage", refresh);
    return () => window.removeEventListener("tre-storage", refresh);
  }, []);

  /** Etiquetas indexadas por tipo e depois por número da vaga. */
  const porTipoVaga = useMemo(() => {
    const m = new Map<string, Map<number, EtiquetaT>>();
    for (const e of etiquetas) {
      const n = parseInt(e.vaga, 10);
      if (isNaN(n)) continue;
      const t = e.tipo ?? "permanente";
      let sub = m.get(t);
      if (!sub) {
        sub = new Map<number, EtiquetaT>();
        m.set(t, sub);
      }
      if (!sub.has(n)) sub.set(n, e);
    }
    return m;
  }, [etiquetas]);

  const alvo = parseInt(q.trim(), 10);

  function abrirVaga(et: EtiquetaT) {
    navigate({
      to: "/historico",
      search: { tipo: et.tipo ?? "permanente", sel: et.id, q: et.vaga },
    });
  }


  function aplicarLote(valor: boolean) {
    const nums = lote
      .split(/[\s,;]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const unicos = Array.from(new Set(nums));
    if (unicos.length === 0) {
      toast.error("Digite os números das vagas separados por vírgula.");
      return;
    }
    let alterados = 0;
    const semEtiqueta: number[] = [];
    for (const n of unicos) {
      const ets = etiquetas.filter((e) => parseInt(e.vaga, 10) === n);
      if (ets.length === 0) {
        semEtiqueta.push(n);
        continue;
      }
      for (const e of ets) {
        etiquetasStore.update(e.id, { digitalizado: valor });
        alterados++;
      }
    }
    setEtiquetas(etiquetasStore.list());
    toast.success(
      `${alterados} etiqueta(s) ${valor ? "marcadas" : "desmarcadas"} como DIGITALIZADO`,
      semEtiqueta.length
        ? { description: `Sem etiqueta: ${semEtiqueta.join(", ")}` }
        : undefined,
    );
  }

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold tracking-tight">MAPA DE ORGANIZAÇÃO DE CAIXAS</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Os corredores estão agrupados por setor e cada grupo tem sua própria numeração, começando
          na vaga 0001. Vagas com <span className="inline-block h-2 w-2 rounded-full bg-white ring-1 ring-black/20 align-middle" /> já
          possuem etiqueta; com <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" /> também estão digitalizadas —
          clique para abrir no histórico já selecionada para impressão.
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

      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <ScanLine className="h-4 w-4 text-primary" /> MARCAR DIGITALIZADO EM LOTE
        </div>
        <p className="text-xs text-muted-foreground">
          Digite os números das vagas separados por vírgula (ex: 101, 102, 145). As etiquetas
          correspondentes recebem a tag DIGITALIZADO e a bolinha verde no mapa.
        </p>
        <textarea
          value={lote}
          onChange={(e) => setLote(e.target.value)}
          rows={2}
          placeholder="101, 102, 145, 300"
          className="w-full rounded-xl px-3 py-2 text-sm bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 outline-none focus:border-primary resize-y"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => aplicarLote(true)}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-md hover:opacity-90 transition"
          >
            Marcar como digitalizado
          </button>
          <button
            type="button"
            onClick={() => aplicarLote(false)}
            className="h-10 px-4 rounded-xl glass-input text-sm font-medium hover:bg-white/80 transition"
          >
            Desmarcar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {MAPA_GRUPOS.map((g) => {
          const open = aberto === g.key;
          const porVaga = (g.tipo ? porTipoVaga.get(g.tipo) : undefined) ?? new Map<number, EtiquetaT>();

          return (
            <section key={g.key} className="glass rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setAberto(open ? null : g.key)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/30 dark:hover:bg-white/5 transition"
              >
                <span className="text-sm font-semibold tracking-tight">
                  CORREDORES {g.sigla} ({g.nome})
                </span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span>
                    corredores {g.corredores[0]?.corredor}–
                    {g.corredores[g.corredores.length - 1]?.corredor} · vagas 0001–
                    {String(g.total).padStart(4, "0")}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                </span>
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-3">
                  {g.corredores.map((c) => (
                    <div key={c.corredor} className="glass-strong rounded-xl p-3 space-y-2">
                      <h3 className="text-xs font-semibold tracking-tight text-muted-foreground">
                        CORREDOR {c.corredor}
                      </h3>
                      <div className="flex gap-3 flex-wrap">
                        {c.estantes.map((est) => (
                          <div
                            key={est.inicio}
                            className="rounded-lg p-1.5 bg-white/40 dark:bg-white/5"
                          >
                            <div
                              className="grid gap-0.5"
                              style={{ gridTemplateColumns: `repeat(${est.cols}, minmax(0, 1fr))` }}
                            >
                              {Array.from(
                                { length: est.rows * est.cols },
                                (_, i) => est.inicio + i,
                              ).map((n) => {
                                const et = porVaga.get(n);
                                const ocupada = !!et;
                                const digitalizada = !!et?.digitalizado;
                                const destaque = n === alvo;
                                return (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => abrirVaga(n)}
                                    disabled={!ocupada}
                                    title={
                                      ocupada
                                        ? `Vaga ${n} — ${digitalizada ? "digitalizada — " : ""}abrir no histórico`
                                        : `Vaga ${n} — livre`
                                    }
                                    className={[
                                      "relative h-5 w-8 rounded text-[9px] leading-none font-medium tabular-nums transition",
                                      ocupada
                                        ? "bg-primary/20 text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"
                                        : "bg-white/50 dark:bg-white/5 text-muted-foreground/70 cursor-default",
                                      destaque ? "ring-2 ring-primary" : "",
                                    ].join(" ")}
                                  >
                                    {n}
                                    {ocupada && (
                                      <span className="absolute top-0.5 right-0.5 flex items-center gap-px">
                                        <span className="h-1 w-1 rounded-full bg-white ring-1 ring-black/20" />
                                        {digitalizada && (
                                          <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                        )}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
