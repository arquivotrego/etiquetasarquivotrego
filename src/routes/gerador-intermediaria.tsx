import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { codigosStore, etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Save, Printer } from "lucide-react";

type Search = { edit?: string };

export const Route = createFileRoute("/gerador-intermediaria")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  head: () => ({ meta: [{ title: "Gerador - ADM - Intermediário — TRE-GO" }] }),
  component: GeradorIntermediariaPage,
});

function GeradorIntermediariaPage() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const [ano, setAno] = useState("");
  const [final, setFinal] = useState("");
  const [vaga, setVaga] = useState("");
  const [codigos, setCodigos] = useState([
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
  ]);
  const [cadastrados, setCadastrados] = useState(codigosStore.list("intermediaria"));
  const finalManuallyEdited = useRef(false);

  useEffect(() => {
    if (!edit) return;
    const e = etiquetasStore.get(edit);
    if (!e) return;
    setAno(e.ano);
    setFinal(e.final);
    setVaga(e.vaga);
    const base = [...e.codigos];
    while (base.length < 4) base.push({ codigo: "", descricao: "" });
    setCodigos(base.slice(0, 4));
    finalManuallyEdited.current = true;
  }, [edit]);

  useEffect(() => {
    const h = () => setCadastrados(codigosStore.list("intermediaria"));
    window.addEventListener("tre-storage", h);
    return () => window.removeEventListener("tre-storage", h);
  }, []);

  const somaPrazo = useMemo(() => {
    if (codigos.length === 0) return 0;
    return codigosStore.find(codigos[0].codigo, "intermediaria")?.prazo ?? 0;
  }, [codigos]);

  useEffect(() => {
    if (finalManuallyEdited.current) return;
    const n = parseInt(ano, 10);
    if (!isNaN(n) && somaPrazo > 0) {
      setFinal(String(n + somaPrazo));
    }
  }, [ano, somaPrazo]);

  function setCodigo(i: number, codigo: string) {
    const next = [...codigos];
    next[i] = { ...next[i], codigo };
    const found = codigosStore.find(codigo, "intermediaria");
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
    tipo: "intermediaria" as const,
  };

  function gerar(printAfter = false) {
    if (!valid) return;
    const payload = {
      ano: ano.trim(),
      final: final.trim(),
      vaga: vaga.trim(),
      codigos: codigos.filter((c) => c.codigo.trim()),
      tipo: "intermediaria" as const,
    };
    let savedId: string;
    if (edit) {
      etiquetasStore.update(edit, payload);
      savedId = edit;
    } else {
      savedId = etiquetasStore.add(payload).id;
    }
    if (printAfter) {
      navigate({ to: "/imprimir", search: { ids: savedId } });
    } else {
      toast.success(edit ? "Etiqueta atualizada com sucesso" : "Etiqueta criada com sucesso", {
        description: "Acesse HISTÓRICO & IMPRESSÃO para visualizar.",
      });
      if (!edit) {
        setAno("");
        setFinal("");
        setVaga("");
        setCodigos([
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
        ]);
        finalManuallyEdited.current = false;
      }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-4">
        <header className="glass rounded-2xl p-5">
          <h2 className="text-xl font-semibold tracking-tight">
            {edit ? "EDITAR ETIQUETA - GUARDA INTERMEDIÁRIA" : "GERADOR - ADM - INTERMEDIÁRIO"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados — o <b>Prazo Final</b> é calculado automaticamente pelo Ano de Produção + Soma dos prazos do código.
          </p>
        </header>

        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Número da Vaga *">
              <input value={vaga} onChange={(e) => setVaga(e.target.value)} className="ios-input" placeholder="0123" inputMode="numeric" />
            </Field>
            <Field label="Ano de Produção *">
              <input value={ano} onChange={(e) => setAno(e.target.value)} className="ios-input" placeholder="2015" inputMode="numeric" />
            </Field>
            <Field label={`Prazo Final * ${somaPrazo ? `(auto: +${somaPrazo} anos)` : ""}`}>
              <input
                value={final}
                onChange={(e) => {
                  finalManuallyEdited.current = true;
                  setFinal(e.target.value);
                }}
                className="ios-input"
                placeholder="2022"
                inputMode="numeric"
              />
            </Field>
          </div>

          <div className="space-y-3">
            {codigos.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-[160px_1fr] gap-3">
                <Field label={`Código ${i + 1}${i === 0 ? " *" : ""}`}>
                  <input
                    list="lista-codigos-inter"
                    value={c.codigo}
                    onChange={(e) => setCodigo(i, e.target.value)}
                    className="ios-input font-mono"
                    placeholder="12.02.04"
                  />
                </Field>
                <Field label="Descrição">
                  <input
                    value={c.descricao}
                    onChange={(e) => setDescricao(i, e.target.value)}
                    className="ios-input"
                    placeholder="SUSPENSÃO DOS DIREITOS POLÍTICOS"
                  />
                </Field>
              </div>
            ))}
            <datalist id="lista-codigos-inter">
              {cadastrados.map((c) => (
                <option key={c.id} value={c.codigo}>
                  {c.descricao}{c.prazo ? ` — ${c.prazo} anos` : ""}
                </option>
              ))}
            </datalist>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              disabled={!valid}
              onClick={() => gerar(false)}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 disabled:opacity-40 transition"
            >
              <Save className="h-4 w-4" /> {edit ? "Salvar alterações" : "Gerar e Salvar"}
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
