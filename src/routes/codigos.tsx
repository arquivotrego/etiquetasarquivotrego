import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { codigosStore, type Codigo, type GuardaCodigo } from "@/lib/storage";
import { SyncIndicator } from "@/components/SyncIndicator";
import { Trash2, Plus, Search } from "lucide-react";

const GUARDAS: { value: GuardaCodigo; label: string }[] = [
  { value: "todos", label: "Ambas as guardas" },
  { value: "permanente", label: "Guarda Permanente" },
  { value: "intermediaria", label: "Guarda Intermediária" },
];

export const Route = createFileRoute("/codigos")({
  head: () => ({
    meta: [{ title: "Cadastro de Códigos — TRE-GO" }],
  }),
  component: CodigosPage,
});

function CodigosPage() {
  const [list, setList] = useState<Codigo[]>([]);
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [guarda, setGuarda] = useState<GuardaCodigo>("todos");
  const [q, setQ] = useState("");
  const [filtroGuarda, setFiltroGuarda] = useState<"all" | GuardaCodigo>("all");

  const refresh = () => setList(codigosStore.list());
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("tre-storage", h);
    return () => window.removeEventListener("tre-storage", h);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim() || !descricao.trim()) return;
    const p = parseInt(prazo, 10);
    codigosStore.add(
      codigo.trim(),
      descricao.trim().toUpperCase(),
      isNaN(p) ? undefined : p,
      guarda,
    );
    toast.success("Código enviado para todos os usuários", {
      description: "Acompanhe o status pelo indicador de sincronização.",
    });
    setCodigo("");
    setDescricao("");
    setPrazo("");
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return list.filter((c) => {
      if (s && !(c.codigo + " " + c.descricao).toLowerCase().includes(s)) return false;
      if (filtroGuarda !== "all") {
        const g = c.guarda ?? "todos";
        if (g !== filtroGuarda && g !== "todos") return false;
      }
      return true;
    });
  }, [list, q, filtroGuarda]);

  const gpCount = list.filter((c) => c.origem === "GP").length;
  const giCount = list.filter((c) => c.origem === "GI").length;
  const userCount = list.filter((c) => c.origem === "USER").length;

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Cadastro de Códigos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {gpCount} códigos padrão (GP) + {giCount} códigos padrão (GI) + {userCount} personalizados.
            Os códigos cadastrados ficam <b>online</b> e aparecem em tempo real para todos os usuários.
          </p>
        </div>
        <SyncIndicator />
      </header>

      <form onSubmit={submit} className="glass-strong rounded-2xl p-5 grid gap-3 md:grid-cols-[160px_1fr_120px_200px_auto]">
        <Field label="Código">
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="13.32" className="ios-input" />
        </Field>
        <Field label="Descrição">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="REGISTRO DE CANDIDATURA" className="ios-input" />
        </Field>
        <Field label="Prazo (anos)">
          <input value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="7" inputMode="numeric" className="ios-input" />
        </Field>
        <Field label="Tipo de guarda">
          <select
            value={guarda}
            onChange={(e) => setGuarda(e.target.value as GuardaCodigo)}
            className="ios-input"
          >
            {GUARDAS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Cadastrar
          </button>
        </div>
      </form>

      <div className="glass-strong rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <Search className="h-4 w-4 ml-2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar código ou descrição…"
          className="flex-1 min-w-40 h-10 px-2 bg-transparent outline-none text-sm"
        />
        <div className="flex gap-1">
          {([
            { v: "all", l: "Todos" },
            { v: "permanente", l: "Permanente" },
            { v: "intermediaria", l: "Intermediária" },
          ] as const).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setFiltroGuarda(o.v)}
              className={`h-9 px-3 rounded-xl text-xs font-medium transition ${
                filtroGuarda === o.v
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "glass-input hover:bg-white/70"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/40 text-sm font-medium">
          {filtered.length} de {list.length} códigos
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum código encontrado.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/60 text-left sticky top-0 backdrop-blur">
                <tr>
                  <th className="px-5 py-2 w-32">Código</th>
                  <th className="px-5 py-2">Descrição</th>
                  <th className="px-5 py-2 w-24 text-center">Prazo</th>
                  <th className="px-5 py-2 w-32">Guarda</th>
                  <th className="px-5 py-2 w-28">Origem</th>
                  <th className="px-5 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-white/40 hover:bg-white/40">
                    <td className="px-5 py-2 font-mono font-semibold">{c.codigo}</td>
                    <td className="px-5 py-2">{c.descricao}</td>
                    <td className="px-5 py-2 text-center font-mono">
                      {c.prazo ? `${c.prazo} anos` : "—"}
                    </td>
                    <td className="px-5 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.origem === "GP"
                          ? "bg-primary/10 text-primary"
                          : c.origem === "GI"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-amber-500/15 text-amber-700"
                      }`}>
                        {c.origem === "GP" ? "Padrão GP" : c.origem === "GI" ? "Padrão GI" : "Personalizado"}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-right">
                      {!c.builtin && (
                        <button
                          onClick={() => codigosStore.remove(c.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .ios-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(20,40,80,0.05);
          font-size: 14px;
          outline: none;
          transition: all 0.15s;
        }
        .ios-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px oklch(0.55 0.16 250 / 0.15);
          background: rgba(255,255,255,0.85);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
