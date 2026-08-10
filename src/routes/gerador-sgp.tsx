import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { etiquetasStore } from "@/lib/storage";
import { Etiqueta } from "@/components/Etiqueta";
import { Save, Printer, History } from "lucide-react";

type Search = { edit?: string };

export const Route = createFileRoute("/gerador-sgp")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Gerador SGP - Permanente — TRE-GO" },
      { name: "description", content: "Gere etiquetas espelho SEREF de guarda permanente da SGP." },
      { property: "og:title", content: "Gerador SGP - Permanente — TRE-GO" },
      { property: "og:description", content: "Gere etiquetas espelho SEREF de guarda permanente da SGP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GeradorSGPPage,
});

function GeradorSGPPage() {
  const navigate = useNavigate();
  const { edit } = Route.useSearch();
  const [local, setLocal] = useState("");
  const [tipoDoc, setTipoDoc] = useState("");
  const [letra, setLetra] = useState("");

  useEffect(() => {
    if (!edit) return;
    const e = etiquetasStore.get(edit);
    if (!e) return;
    setLocal(e.local ?? "");
    setTipoDoc(e.tipoDoc ?? "");
    setLetra(e.letra ?? "");
  }, [edit]);

  const valid = useMemo(
    () => local.trim() && tipoDoc.trim() && letra.trim(),
    [local, tipoDoc, letra],
  );

  const preview = {
    ano: "",
    final: "",
    vaga: "",
    codigos: [],
    local,
    tipoDoc,
    letra,
    tipo: "sgp" as const,
  };

  function gerar(printAfter = false) {
    if (!valid) return;
    const payload = {
      ano: "",
      final: "",
      vaga: "",
      codigos: [],
      local: local.trim(),
      tipoDoc: tipoDoc.trim(),
      letra: letra.trim(),
      tipo: "sgp" as const,
    };
    let savedId: string;
    if (edit) {
      etiquetasStore.update(edit, payload);
      savedId = edit;
    } else {
      savedId = etiquetasStore.add(payload).id;
    }
    if (printAfter) {
      navigate({ to: "/imprimir", search: { ids: savedId, mode: "single" } });
    } else {
      toast.success(edit ? "Etiqueta atualizada com sucesso" : "Etiqueta criada com sucesso", {
        description: "Acesse HISTÓRICO & IMPRESSÃO para visualizar.",
      });
      if (!edit) {
        setLocal("");
        setTipoDoc("");
        setLetra("");
      }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-4">
        <header className="glass rounded-2xl p-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {edit ? "EDITAR ETIQUETA - SGP - PERMANENTE" : "GERADOR - SGP - PERMANENTE"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modelo espelho SEREF. Apenas <b>LOCAL</b>, <b>TIPO</b> e <b>LETRA</b> são editáveis.
            </p>
          </div>
          <Link
            to="/historico"
            search={{ tipo: "sgp" }}
            className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 transition shrink-0"
          >
            <History className="h-4 w-4" /> Histórico
          </Link>
        </header>

        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <Field label="LOCAL *">
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value.toUpperCase())}
              className="ios-input"
              placeholder="ARMÁRIO 01"
            />
          </Field>
          <Field label="TIPO *">
            <input
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value.toUpperCase())}
              className="ios-input"
              placeholder="ATIVOS"
            />
          </Field>
          <Field label="LETRA *">
            <input
              value={letra}
              onChange={(e) => setLetra(e.target.value.toUpperCase())}
              className="ios-input"
              placeholder="A"
            />
          </Field>

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
