import { DigitalizadoSwitch } from "@/components/DigitalizadoSwitch";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { codigosStore, etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { CodigoPicker } from "@/components/CodigoPicker";
import { Save, Printer, History } from "lucide-react";

type Search = { edit?: string };

export const Route = createFileRoute("/gerador-historico")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  head: () => ({ meta: [{ title: "Gerador - Histórico - Permanente — TRE-GO" }] }),
  component: GeradorHistoricoPage,
});

function GeradorHistoricoPage() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const [anoDocs, setAnoDocs] = useState("");
  const [vaga, setVaga] = useState("");
  const [digitalizado, setDigitalizado] = useState(false);
  const [codigos, setCodigos] = useState([
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
    { codigo: "", descricao: "" },
  ]);
  const [cadastrados, setCadastrados] = useState(codigosStore.list());

  useEffect(() => {
    if (!edit) return;
    const e = etiquetasStore.get(edit);
    if (!e) return;
    setAnoDocs(e.final);
    setVaga(e.vaga);
    setDigitalizado(!!e.digitalizado);
    const base = [...e.codigos];
    while (base.length < 4) base.push({ codigo: "", descricao: "" });
    setCodigos(base.slice(0, 4));
  }, [edit]);

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
    const alvo = descricao.trim().toLowerCase();
    const found = cadastrados.find((c) => c.descricao.trim().toLowerCase() === alvo);
    if (found) next[i].codigo = found.codigo;
    setCodigos(next);
  }

  const valid = useMemo(
    () => anoDocs.trim() && vaga.trim() && codigos[0].codigo.trim(),
    [anoDocs, vaga, codigos],
  );

  const preview = {
    ano: "",
    final: anoDocs,
    vaga,
    codigos: codigos.filter((c) => c.codigo.trim()),
    tipo: "historico" as const,
  };

  function gerar(printAfter = false) {
    if (!valid) return;
    const payload = {
      ano: "",
      final: anoDocs.trim(),
      vaga: vaga.trim(),
      codigos: codigos.filter((c) => c.codigo.trim()),
      digitalizado,
      tipo: "historico" as const,
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
        setAnoDocs("");
        setVaga("");
        setDigitalizado(false);
        setCodigos([
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
          { codigo: "", descricao: "" },
        ]);
      }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-4">
        <header className="glass rounded-2xl p-5 flex flex-wrap items-start justify-between gap-3">
          <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {edit ? "EDITAR ETIQUETA - HISTÓRICO - PERMANENTE" : "GERADOR - HISTÓRICO - PERMANENTE"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados abaixo. A etiqueta será marcada como <b>HISTÓRICO</b>.
          </p>
</div>
          <Link
            to="/historico"
            search={{ tipo: "historico" }}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 transition shrink-0"
          >
            <History className="h-4 w-4" /> Histórico
          </Link>
        </header>

        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Número da Vaga *">
              <input value={vaga} onChange={(e) => setVaga(e.target.value)} className="ios-input" placeholder="0123" inputMode="numeric" />
            </Field>
            <Field label="Ano dos documentos *">
              <input value={anoDocs} onChange={(e) => setAnoDocs(e.target.value)} className="ios-input" placeholder="1998" inputMode="numeric" />
            </Field>
          </div>

          <div className="space-y-3">
            {codigos.map((c, i) => (
              <CodigoPicker
                key={i}
                index={i}
                items={cadastrados}
                codigo={c.codigo}
                descricao={c.descricao}
                onChange={(v) => {
                  const next = [...codigos];
                  next[i] = v;
                  setCodigos(next);
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
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
            <DigitalizadoSwitch checked={digitalizado} onChange={setDigitalizado} />
          </div>
        </div>
      </div>

      <div className="min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-2xl p-4 overflow-x-auto">
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
