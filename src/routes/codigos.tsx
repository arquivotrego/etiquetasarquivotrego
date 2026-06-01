import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { codigosStore, type Codigo } from "@/lib/storage";
import { Trash2, Plus } from "lucide-react";

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
    codigosStore.add(codigo.trim(), descricao.trim().toUpperCase());
    setCodigo("");
    setDescricao("");
  }

  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold tracking-tight">Cadastro de Códigos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre os códigos documentais (ex.: 13.32) e suas descrições para alimentar o gerador.
        </p>
      </header>

      <form onSubmit={submit} className="glass-strong rounded-2xl p-5 grid gap-3 md:grid-cols-[180px_1fr_auto]">
        <Field label="Código">
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="13.32"
            className="ios-input"
          />
        </Field>
        <Field label="Descrição">
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="REGISTRO DE CANDIDATURA"
            className="ios-input"
          />
        </Field>
        <div className="flex items-end">
          <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Cadastrar
          </button>
        </div>
      </form>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/40 text-sm font-medium">
          Códigos cadastrados ({list.length})
        </div>
        {list.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum código cadastrado ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/40 text-left">
              <tr>
                <th className="px-5 py-2 w-40">Código</th>
                <th className="px-5 py-2">Descrição</th>
                <th className="px-5 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-white/40 hover:bg-white/40">
                  <td className="px-5 py-2 font-mono font-semibold">{c.codigo}</td>
                  <td className="px-5 py-2">{c.descricao}</td>
                  <td className="px-5 py-2 text-right">
                    <button
                      onClick={() => codigosStore.remove(c.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
