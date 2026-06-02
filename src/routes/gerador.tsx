import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { codigosStore, etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Save, Printer } from "lucide-react";

export const Route = createFileRoute("/gerador")({
  head: () => ({ meta: [{ title: "Gerador de Etiquetas — TRE-GO" }] }),
  component: GeradorPage,
});

function GeradorPage() {
  const navigate = useNavigate();
  const [ano, setAno] = useState("");
  const [final, setFinal] = useState("");
  const [vaga, setVaga] = useState("");
  const [codigos, setCodigos] = useState([
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
  ]);
  const [cadastrados, setCadastrados] = useState(codigosStore.list());

  useEffect(() => {
    const h = () => setCadastrados(codigosStore.list());
    window.addEventListener("tre-storage", h);
    return () => window.removeEventListener("tre-storage", h);
  }, []);

  function setCodigo(i: number, codigo: string) {
    const next = [...codigos];
    next[i] = { ...next[i], codigo };
    const found = codigosStore.find(codigo);
    if (found) next[i].descricao = found.descricao;
    setCodigos(next);
  }
  function setDescricao(i: number, descricao: string) {
    const next = [...codigos];
    next[i] = { ...next[i], descricao };
    setCodigos(next);
  }

  const valid = useMemo(
    () => ano.trim() && final.trim() && vaga.trim() && codigos[0].codigo.trim(),
    [ano, final, vaga, codigos],
  );

  const preview = {
    ano,
    final,
    vaga,
    codigos: codigos.filter((c) => c.codigo.trim()),
  };

  function gerar(printAfter = false) {
    if (!valid) return;
    const saved = etiquetasStore.add({
      ano: ano.trim(),
      final: final.trim(),
      vaga: vaga.trim(),
      codigos: codigos.filter((c) => c.codigo.trim()),
    });
    if (printAfter) {
      navigate({ to: "/imprimir", search: { ids: saved.id } });
    } else {
      navigate({ to: "/historico" });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      {/* Form */}
      <div className="space-y-4">
        <header className="glass rounded-2xl p-5">
          <h2 className="text-xl font-semibold tracking-tight">Gerador de Etiquetas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados — a pré-visualização é atualizada em tempo real.
          </p>
        </header>

        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Número da Vaga *">
              <input value={vaga} onChange={(e) => setVaga(e.target.value)} className="ios-input" placeholder="0123" inputMode="numeric" />
            </Field>
            <Field label="Ano de Produção *">
              <input value={ano} onChange={(e) => setAno(e.target.value)} className="ios-input" placeholder="2024" inputMode="numeric" />
            </Field>
            <Field label="Final *">
              <input value={final} onChange={(e) => setFinal(e.target.value)} className="ios-input" placeholder="2025" inputMode="numeric" />
            </Field>
          </div>

          <div className="space-y-3">
            {codigos.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-[160px_1fr] gap-3">
                <Field label={`Código ${i + 1}${i === 0 ? " *" : ""}`}>
                  <input
                    list="lista-codigos"
                    value={c.codigo}
                    onChange={(e) => setCodigo(i, e.target.value)}
                    className="ios-input font-mono"
                    placeholder="13.32"
                  />
                </Field>
                <Field label="Descrição">
                  <input
                    value={c.descricao}
                    onChange={(e) => setDescricao(i, e.target.value)}
                    className="ios-input"
                    placeholder="REGISTRO DE CANDIDATURA"
                  />
                </Field>
              </div>
            ))}
            <datalist id="lista-codigos">
              {cadastrados.map((c) => (
                <option key={c.id} value={c.codigo}>{c.descricao}</option>
              ))}
            </datalist>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              disabled={!valid}
              onClick={() => gerar(false)}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 disabled:opacity-40 transition"
            >
              <Save className="h-4 w-4" /> Gerar e Salvar
            </button>
            <button
              disabled={!valid}
              onClick={() => gerar(true)}
              className="h-11 px-5 rounded-xl glass-input font-medium inline-flex items-center gap-2 hover:bg-white/80 disabled:opacity-40 transition"
            >
              <Printer className="h-4 w-4" /> Salvar e Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs font-medium text-muted-foreground mb-3 px-1">Pré-visualização</div>
          <div className="origin-top-left scale-[0.75] sm:scale-100" style={{ transformOrigin: "top left" }}>
            <Etiqueta data={preview} />
          </div>
        </div>
      </div>

      <style>{`
        .ios-input {
          width: 100%; height: 44px; padding: 0 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(20,40,80,0.05);
          font-size: 14px; outline: none; transition: all 0.15s;
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
