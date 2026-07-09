import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { etiquetasStore, type Etiqueta as EtiquetaT, type TipoEtiqueta } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Printer, Trash2, Search, Filter, X, Pencil } from "lucide-react";

export const Route = createFileRoute("/historico")({
  head: () => ({ meta: [{ title: "Histórico de Etiquetas — TRE-GO" }] }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const [list, setList] = useState<EtiquetaT[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<EtiquetaT | null>(null);
  const [tab, setTab] = useState<TipoEtiqueta>("permanente");

  // Filtros avançados
  const [showFilters, setShowFilters] = useState(false);
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [vagaMin, setVagaMin] = useState<number | null>(null);
  const [vagaMax, setVagaMax] = useState<number | null>(null);

  const refresh = () => setList(etiquetasStore.list());
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("tre-storage", h);
    return () => window.removeEventListener("tre-storage", h);
  }, []);

  // Lista por categoria selecionada
  const byTipo = useMemo(
    () => list.filter((e) => (e.tipo ?? "permanente") === tab),
    [list, tab],
  );

  // Min/Max global de vagas para a categoria
  const { minVaga, maxVaga } = useMemo(() => {
    const nums = byTipo
      .map((e) => parseInt(e.vaga, 10))
      .filter((n) => !isNaN(n));
    if (!nums.length) return { minVaga: 0, maxVaga: 0 };
    return { minVaga: Math.min(...nums), maxVaga: Math.max(...nums) };
  }, [byTipo]);

  // Inicializa range quando a categoria muda
  useEffect(() => {
    setVagaMin(minVaga);
    setVagaMax(maxVaga);
  }, [minVaga, maxVaga, tab]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    const ano = filtroAno.trim();
    const cod = filtroCodigo.trim().toLowerCase();
    return byTipo.filter((e) => {
      if (s) {
        const hay = [e.ano, e.final, e.vaga, ...e.codigos.map((c) => c.codigo + " " + c.descricao)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (ano && !e.ano.includes(ano)) return false;
      if (cod && !e.codigos.some((c) => c.codigo.toLowerCase().includes(cod))) return false;
      const n = parseInt(e.vaga, 10);
      if (!isNaN(n)) {
        if (vagaMin !== null && n < vagaMin) return false;
        if (vagaMax !== null && n > vagaMax) return false;
      }
      return true;
    });
  }, [byTipo, q, filtroAno, filtroCodigo, vagaMin, vagaMax]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
  const allSelected = filtered.length > 0 && filtered.every((e) => selected.includes(e.id));
  function toggleAll() {
    if (allSelected) setSelected((s) => s.filter((id) => !filtered.some((e) => e.id === id)));
    else setSelected((s) => Array.from(new Set([...s, ...filtered.map((e) => e.id)])));
  }

  const printHref = selected.length
    ? `/imprimir?ids=${selected.join(",")}`
    : null;

  const counts = {
    permanente: list.filter((e) => (e.tipo ?? "permanente") === "permanente").length,
    intermediaria: list.filter((e) => e.tipo === "intermediaria").length,
    historico: list.filter((e) => e.tipo === "historico").length,
  };

  function clearFilters() {
    setFiltroAno("");
    setFiltroCodigo("");
    setVagaMin(minVaga);
    setVagaMax(maxVaga);
    setQ("");
  }

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Histórico & Impressão</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione quantas etiquetas quiser — serão impressas 2 por folha A4 paisagem.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`h-11 px-4 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition ${
              showFilters ? "bg-primary text-primary-foreground shadow" : "glass-input hover:bg-white/80"
            }`}
          >
            <Filter className="h-4 w-4" /> Filtros
          </button>
          {filtered.length > 0 && (
            <button
              onClick={toggleAll}
              className="h-11 px-4 rounded-xl glass-input text-sm font-medium hover:bg-white/80"
            >
              {allSelected ? "Desmarcar todas" : "Selecionar todas"}
            </button>
          )}
          {printHref ? (
            <Link
              to="/imprimir"
              search={{ ids: selected.join(",") }}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 transition"
            >
              <Printer className="h-4 w-4" /> Imprimir ({selected.length})
            </Link>
          ) : null}
        </div>
      </header>

      {/* Tabs por categoria */}
      <div className="glass rounded-2xl p-2 flex gap-2 flex-wrap">
        {([
          { key: "permanente", label: "Guarda Permanente" },
          { key: "intermediaria", label: "Guarda Intermediária" },
          { key: "historico", label: "Histórico - Permanente" },
        ] as { key: TipoEtiqueta; label: string }[]).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelected([]);
              }}
              className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium transition ${
                active ? "bg-primary text-primary-foreground shadow" : "hover:bg-white/60"
              }`}
            >
              {t.label} ({counts[t.key]})
            </button>
          );
        })}
      </div>

      <div className="glass-strong rounded-2xl p-3 flex items-center gap-2">
        <Search className="h-4 w-4 ml-2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar por ano, vaga, código ou descrição…"
          className="flex-1 h-10 px-2 bg-transparent outline-none text-sm"
        />
      </div>

      {showFilters && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filtros avançados</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground block mb-1.5">Ano de Produção</span>
              <input
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
                placeholder="ex.: 2024"
                className="w-full h-10 px-3 rounded-xl bg-white/70 border border-white/60 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground block mb-1.5">Código de Documento</span>
              <input
                value={filtroCodigo}
                onChange={(e) => setFiltroCodigo(e.target.value)}
                placeholder="ex.: 12.02"
                className="w-full h-10 px-3 rounded-xl bg-white/70 border border-white/60 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {maxVaga > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Intervalo de Vaga
                </span>
                <span className="text-xs font-mono">
                  {vagaMin ?? minVaga} — {vagaMax ?? maxVaga}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] w-8 text-muted-foreground">Min</span>
                  <input
                    type="range"
                    min={minVaga}
                    max={maxVaga}
                    value={vagaMin ?? minVaga}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setVagaMin(Math.min(v, vagaMax ?? maxVaga));
                    }}
                    className="flex-1 accent-[color:var(--color-primary)]"
                  />
                  <input
                    type="number"
                    value={vagaMin ?? minVaga}
                    onChange={(e) => setVagaMin(parseInt(e.target.value, 10) || 0)}
                    className="w-20 h-8 px-2 rounded-lg bg-white/70 border border-white/60 text-sm text-center"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] w-8 text-muted-foreground">Max</span>
                  <input
                    type="range"
                    min={minVaga}
                    max={maxVaga}
                    value={vagaMax ?? maxVaga}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setVagaMax(Math.max(v, vagaMin ?? minVaga));
                    }}
                    className="flex-1 accent-[color:var(--color-primary)]"
                  />
                  <input
                    type="number"
                    value={vagaMax ?? maxVaga}
                    onChange={(e) => setVagaMax(parseInt(e.target.value, 10) || 0)}
                    className="w-20 h-8 px-2 rounded-lg bg-white/70 border border-white/60 text-sm text-center"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ex.: filtrar da vaga 10 a 20 mostra somente essas etiquetas e "Selecionar todas" seleciona apenas elas.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Nenhuma etiqueta encontrada.
        </div>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((e) => {
            const isSel = selected.includes(e.id);
            return (
              <li
                key={e.id}
                className={[
                  "glass rounded-2xl p-4 flex items-center gap-4 transition",
                  isSel ? "ring-2 ring-primary" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggle(e.id)}
                  className="h-5 w-5 accent-[color:var(--color-primary)]"
                />
                <div className="flex-1 min-w-0 grid sm:grid-cols-4 gap-2 text-sm">
                  <div><span className="text-xs text-muted-foreground block">Vaga</span><b>{e.vaga}</b></div>
                  <div className="truncate">
                    <span className="text-xs text-muted-foreground block">Código</span>
                    <b className="truncate">{e.codigos.map((c) => c.codigo).join(", ")}</b>
                  </div>
                  <div><span className="text-xs text-muted-foreground block">Ano de Produção</span><b>{e.ano}</b></div>
                  <div><span className="text-xs text-muted-foreground block">Final</span><b>{e.final || "—"}</b></div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreview(e)}
                    className="h-9 px-3 rounded-lg glass-input text-xs font-medium hover:bg-white/80"
                  >
                    Ver
                  </button>
                  <Link
                    to={
                      e.tipo === "intermediaria"
                        ? "/gerador-intermediaria"
                        : e.tipo === "historico"
                        ? "/gerador-historico"
                        : "/gerador"
                    }
                    search={{ edit: e.id }}
                    className="h-9 px-3 rounded-lg glass-input text-xs font-medium inline-flex items-center gap-1.5 hover:bg-white/80"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Link>
                  <Link
                    to="/imprimir"
                    search={{ ids: e.id }}
                    className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90"
                  >
                    <Printer className="h-3.5 w-3.5" /> Reimprimir
                  </Link>
                  <button
                    onClick={() => {
                      etiquetasStore.remove(e.id);
                      setSelected((s) => s.filter((x) => x !== e.id));
                    }}
                    className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-destructive grid place-items-center"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4 no-print"
          onClick={() => setPreview(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl p-4 max-h-[90vh] overflow-auto">
            <Etiqueta data={preview} />
          </div>
        </div>
      )}
    </div>
  );
}
