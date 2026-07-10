import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, Plus, Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/tre-go-logo.png";

export const Route = createFileRoute("/certidoes")({
  head: () => ({ meta: [{ title: "Gerador de Certidões — TRE-GO" }] }),
  component: CertidoesPage,
});

const MOTIVOS_KEY = "tre_certidao_motivos_v1";
const RESP_KEY = "tre_certidao_responsaveis_v1";

const DEFAULT_MOTIVOS = [
  "a(as) página(s) é(são) de documento(s) antigo(s) que se deteriorou(aram) com o tempo",
  "contém uma mídia digital",
  "é um mapa de tamanho grande onde não há condições devido ao nosso equipamento de digitalização",
];
const DEFAULT_RESP = ["Thatiane Silva Coleta", "Alessandra Silva Taveira"];

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function readList(key: string, defaults: string[]): string[] {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    const extra = raw ? (JSON.parse(raw) as string[]) : [];
    return [...defaults, ...extra];
  } catch {
    return defaults;
  }
}
function pushList(key: string, value: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(key);
  const extra = raw ? (JSON.parse(raw) as string[]) : [];
  if (!extra.includes(value)) {
    extra.push(value);
    localStorage.setItem(key, JSON.stringify(extra));
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function parseBR(text: string): Date | null {
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  if (
    dt.getFullYear() !== Number(y) ||
    dt.getMonth() !== Number(mo) - 1 ||
    dt.getDate() !== Number(d)
  ) return null;
  return dt;
}
function formatBR(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function formatExtenso(d: Date) {
  return `${pad2(d.getDate())}, de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function CertidoesPage() {
  const [protocolo, setProtocolo] = useState("");
  const [paginas, setPaginas] = useState("");
  const [motivos, setMotivos] = useState<string[]>(DEFAULT_MOTIVOS);
  const [responsaveis, setResponsaveis] = useState<string[]>(DEFAULT_RESP);
  const [motivo, setMotivo] = useState<string>(DEFAULT_MOTIVOS[0]);
  const [responsavel, setResponsavel] = useState<string>(DEFAULT_RESP[0]);
  const [data, setData] = useState<Date | undefined>(new Date());
  const [dataText, setDataText] = useState<string>(formatBR(new Date()));
  const [openCal, setOpenCal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMotivos(readList(MOTIVOS_KEY, DEFAULT_MOTIVOS));
    setResponsaveis(readList(RESP_KEY, DEFAULT_RESP));
  }, []);

  function addMotivo() {
    const v = window.prompt("Digite o novo motivo:")?.trim();
    if (!v) return;
    pushList(MOTIVOS_KEY, v);
    setMotivos((prev) => [...prev, v]);
    setMotivo(v);
  }
  function addResponsavel() {
    const v = window.prompt("Digite o nome do novo responsável:")?.trim();
    if (!v) return;
    pushList(RESP_KEY, v);
    setResponsaveis((prev) => [...prev, v]);
    setResponsavel(v);
  }

  function onDataTextChange(v: string) {
    setDataText(v);
    const parsed = parseBR(v);
    if (parsed) setData(parsed);
  }
  function onCalendarSelect(d: Date | undefined) {
    if (!d) return;
    setData(d);
    setDataText(formatBR(d));
    setOpenCal(false);
  }

  const dataExtenso = useMemo(() => (data ? formatExtenso(data) : ""), [data]);
  const canRender = protocolo.trim() && paginas.trim() && motivo.trim() && responsavel.trim() && data;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <header className="glass rounded-2xl p-5">
          <h2 className="text-xl font-semibold tracking-tight">GERADOR DE CERTIDÕES</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os campos abaixo — a certidão é gerada automaticamente ao lado.
          </p>
        </header>

        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <Field label="Protocolo *">
            <input
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value)}
              className="ios-input"
              placeholder="0000000-00.0000.0.00.0000"
            />
          </Field>

          <Field label="Páginas *">
            <input
              value={paginas}
              onChange={(e) => setPaginas(e.target.value)}
              className="ios-input"
              placeholder="ex.: 12, 15 e 20"
            />
          </Field>

          <Field label="Motivo *">
            <div className="flex gap-2">
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="ios-input flex-1"
              >
                {motivos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMotivo}
                className="h-11 px-3 rounded-xl glass-input font-medium inline-flex items-center gap-1 hover:bg-white/80"
                title="Adicionar novo motivo"
              >
                <Plus className="h-4 w-4" /> Novo
              </button>
            </div>
          </Field>

          <Field label="Responsável *">
            <div className="flex gap-2">
              <select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="ios-input flex-1"
              >
                {responsaveis.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addResponsavel}
                className="h-11 px-3 rounded-xl glass-input font-medium inline-flex items-center gap-1 hover:bg-white/80"
                title="Adicionar novo responsável"
              >
                <Plus className="h-4 w-4" /> Novo
              </button>
            </div>
          </Field>

          <Field label="Data *">
            <div className="flex gap-2">
              <input
                value={dataText}
                onChange={(e) => onDataTextChange(e.target.value)}
                className="ios-input flex-1"
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
              />
              <Popover open={openCal} onOpenChange={setOpenCal}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-11 px-3 rounded-xl glass-input font-medium inline-flex items-center gap-1 hover:bg-white/80"
                    title="Escolher no calendário"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={onCalendarSelect}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </Field>

          <div className="pt-2">
            <button
              type="button"
              disabled={!canRender}
              onClick={() => window.print()}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 shadow-md hover:opacity-90 disabled:opacity-40 transition"
            >
              <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs font-medium text-muted-foreground mb-3 px-1">Pré-visualização</div>
          <div ref={printRef} className="print-area">
            <div className="print-page certidao">
              <h1 className="cert-title">CERTIDÃO</h1>
              <div className="cert-spacer" />
              <p className="cert-body">
                Certifico que, no processo de digitalização do documento "
                {protocolo || <span className="cert-placeholder">{"{PROTOCOLO}"}</span>}
                ", verificou-se que as folhas n° "
                {paginas || <span className="cert-placeholder">{"{PÁGINAS}"}</span>}
                " no processo original{" "}
                <strong style={{ color: "red" }}>
                  {motivo || "{MOTIVO}"}
                </strong>
                , o que impede a(as) página(s) ser digitalizada(s).
              </p>
              <p className="cert-body cert-goiania">
                Goiânia, {dataExtenso || <span className="cert-placeholder">{"{DATA}"}</span>}.
              </p>
              <div className="cert-sign">
                <p className="cert-resp">{responsavel || "{RESPONSÁVEL}"}</p>
                <p className="cert-role">Seção de Gestão Documental</p>
              </div>
            </div>
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
        .certidao {
          background: #fff;
          color: #000;
          font-family: "Times New Roman", "Times", serif;
          font-size: 12pt;
          line-height: 1.6;
          padding: 2.5cm;
          min-height: 27cm;
          width: 21cm;
          max-width: 100%;
          text-align: justify;
        }
        .certidao .cert-title {
          text-align: center;
          font-weight: 700;
          font-size: 14pt;
          margin: 0 0 1.5cm 0;
          letter-spacing: 1px;
        }
        .certidao .cert-spacer { height: 0.5cm; }
        .certidao .cert-body {
          text-indent: 2cm;
          margin: 0 0 0.8cm 0;
        }
        .certidao .cert-goiania { text-indent: 2cm; margin-top: 1.5cm; }
        .certidao .cert-sign { margin-top: 2.5cm; text-align: center; }
        .certidao .cert-resp { margin: 0; font-weight: 700; }
        .certidao .cert-role { margin: 0; }
        .certidao .cert-placeholder { color: #888; font-style: italic; }
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
