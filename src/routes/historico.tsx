import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { etiquetasStore, type Etiqueta as EtiquetaT } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Printer, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/historico")({
  head: () => ({ meta: [{ title: "Histórico de Etiquetas — TRE-GO" }] }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const [list, setList] = useState<EtiquetaT[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<EtiquetaT | null>(null);

  const refresh = () => setList(etiquetasStore.list());
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("tre-storage", h);
    return () => window.removeEventListener("tre-storage", h);
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return list;
    return list.filter((e) =>
      [e.ano, e.final, e.vaga, ...e.codigos.map((c) => c.codigo + " " + c.descricao)]
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [list, q]);

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

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Histórico & Impressão</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione até 2 etiquetas para imprimir lado a lado em A4 paisagem.
          </p>
        </div>
        <div className="flex gap-2">
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

      <div className="glass-strong rounded-2xl p-3 flex items-center gap-2">
        <Search className="h-4 w-4 ml-2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar por ano, vaga, código ou descrição…"
          className="flex-1 h-10 px-2 bg-transparent outline-none text-sm"
        />
      </div>

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
                  <div><span className="text-xs text-muted-foreground block">Ano</span><b>{e.ano}</b></div>
                  <div><span className="text-xs text-muted-foreground block">Final</span><b>{e.final || "—"}</b></div>
                  <div><span className="text-xs text-muted-foreground block">Vaga</span><b>{e.vaga}</b></div>
                  <div className="truncate">
                    <span className="text-xs text-muted-foreground block">Códigos</span>
                    <b className="truncate">{e.codigos.map((c) => c.codigo).join(", ")}</b>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreview(e)}
                    className="h-9 px-3 rounded-lg glass-input text-xs font-medium hover:bg-white/80"
                  >
                    Ver
                  </button>
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
