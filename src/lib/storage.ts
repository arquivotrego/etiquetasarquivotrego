import { supabase } from "@/integrations/supabase/client";
import { TEMPORALIDADE_GP } from "./temporalidade";
import { TEMPORALIDADE_GI } from "./temporalidade-gi";

export type Origem = "GP" | "GI" | "USER";
export type Codigo = {
  id: string;
  codigo: string;
  descricao: string;
  prazo?: number;
  builtin?: boolean;
  origem?: Origem;
};
export type TipoEtiqueta = "permanente" | "intermediaria" | "historico" | "sgp";
export type Etiqueta = {
  id: string;
  ano: string;
  final: string;
  vaga: string;
  codigos: { codigo: string; descricao: string }[];
  destino?: string;
  guarda?: string;
  permanente?: boolean;
  tipo?: TipoEtiqueta;
  digitalizado?: boolean;
  local?: string;
  tipoDoc?: string;
  letra?: string;
  createdAt: number;
};

const BUILTIN_GP: Codigo[] = TEMPORALIDADE_GP.map((t) => ({
  id: `builtin-gp-${t.codigo}`,
  codigo: t.codigo,
  descricao: t.descricao,
  prazo: t.prazo,
  builtin: true,
  origem: "GP",
}));
const BUILTIN_GI: Codigo[] = TEMPORALIDADE_GI.map((t) => ({
  id: `builtin-gi-${t.codigo}`,
  codigo: t.codigo,
  descricao: t.descricao,
  prazo: t.prazo,
  builtin: true,
  origem: "GI",
}));

const BUILTIN_CODES = new Set<string>([
  ...BUILTIN_GP.map((c) => c.codigo),
  ...BUILTIN_GI.map((c) => c.codigo),
]);

function builtinsFor(tipo?: TipoEtiqueta): Codigo[] {
  if (tipo === "intermediaria") return BUILTIN_GI;
  if (tipo === "permanente") return BUILTIN_GP;
  return [...BUILTIN_GP, ...BUILTIN_GI];
}

/* ------------------------------------------------------------------ */
/* Cache local sincronizado com o banco (Realtime)                     */
/* ------------------------------------------------------------------ */

let cacheCodigos: Codigo[] = [];
let cacheEtiquetas: Etiqueta[] = [];

function notify(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tre-storage", { detail: { key } }));
}

type CodigoRow = {
  id: string;
  codigo: string;
  descricao: string;
  prazo: number | null;
};

type EtiquetaRow = {
  id: string;
  ano: string;
  final: string;
  vaga: string;
  codigos: unknown;
  destino: string | null;
  guarda: string | null;
  permanente: boolean | null;
  tipo: string | null;
  digitalizado: boolean | null;
  local: string | null;
  tipo_doc: string | null;
  letra: string | null;
  created_at: string;
};

function mapCodigo(r: CodigoRow): Codigo {
  return {
    id: r.id,
    codigo: r.codigo,
    descricao: r.descricao,
    prazo: r.prazo ?? undefined,
    origem: "USER",
  };
}

function mapEtiqueta(r: EtiquetaRow): Etiqueta {
  return {
    id: r.id,
    ano: r.ano,
    final: r.final,
    vaga: r.vaga,
    codigos: Array.isArray(r.codigos)
      ? (r.codigos as { codigo: string; descricao: string }[])
      : [],
    destino: r.destino ?? undefined,
    guarda: r.guarda ?? undefined,
    permanente: r.permanente ?? undefined,
    tipo: (r.tipo as TipoEtiqueta | null) ?? undefined,
    digitalizado: r.digitalizado ?? false,
    local: r.local ?? undefined,
    tipoDoc: r.tipo_doc ?? undefined,
    letra: r.letra ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

function toRow(e: Partial<Etiqueta>) {
  const row: Record<string, unknown> = {};
  if (e.ano !== undefined) row['ano'] = e.ano;
  if (e.final !== undefined) row['final'] = e.final;
  if (e.vaga !== undefined) row['vaga'] = e.vaga;
  if (e.codigos !== undefined) row['codigos'] = e.codigos;
  if (e.destino !== undefined) row['destino'] = e.destino;
  if (e.guarda !== undefined) row['guarda'] = e.guarda;
  if (e.permanente !== undefined) row['permanente'] = e.permanente;
  if (e.tipo !== undefined) row['tipo'] = e.tipo;
  if (e.digitalizado !== undefined) row['digitalizado'] = e.digitalizado;
  if (e.local !== undefined) row['local'] = e.local;
  if (e.tipoDoc !== undefined) row['tipo_doc'] = e.tipoDoc;
  if (e.letra !== undefined) row['letra'] = e.letra;
  return row;
}

let started = false;

/** Carrega os dados do banco e mantém o cache sincronizado em tempo real. */
export function startRealtimeSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  const loadCodigos = async () => {
    const { data } = await supabase.from("codigos").select("*");
    if (data) {
      cacheCodigos = (data as CodigoRow[])
        .filter((r) => !BUILTIN_CODES.has(r.codigo.trim()))
        .map(mapCodigo);
      notify("codigos");
    }
  };
  const loadEtiquetas = async () => {
    const { data } = await supabase.from("etiquetas").select("*");
    if (data) {
      cacheEtiquetas = (data as EtiquetaRow[]).map(mapEtiqueta);
      notify("etiquetas");
    }
  };

  void loadCodigos();
  void loadEtiquetas();

  supabase
    .channel("tre-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codigos" },
      () => void loadCodigos(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "etiquetas" },
      () => void loadEtiquetas(),
    )
    .subscribe();
}

/* ------------------------------------------------------------------ */
/* Stores (API síncrona sobre o cache, escrita no banco)               */
/* ------------------------------------------------------------------ */

export const codigosStore = {
  list: (tipo?: TipoEtiqueta): Codigo[] =>
    [...builtinsFor(tipo), ...cacheCodigos].sort((a, b) =>
      a.codigo.localeCompare(b.codigo, "pt-BR", { numeric: true }),
    ),
  listUser: () => cacheCodigos,
  add: (codigo: string, descricao: string, prazo?: number) => {
    const existing = cacheCodigos.find((c) => c.codigo === codigo);
    const item: Codigo = existing
      ? { ...existing, descricao, prazo: prazo ?? existing.prazo }
      : { id: crypto.randomUUID(), codigo, descricao, prazo, origem: "USER" };
    cacheCodigos = existing
      ? cacheCodigos.map((c) => (c.id === item.id ? item : c))
      : [...cacheCodigos, item];
    notify("codigos");
    void supabase
      .from("codigos")
      .upsert(
        { id: item.id, codigo: item.codigo, descricao: item.descricao, prazo: item.prazo ?? null },
        { onConflict: "codigo" },
      );
    return item;
  },
  remove: (id: string) => {
    cacheCodigos = cacheCodigos.filter((c) => c.id !== id);
    notify("codigos");
    void supabase.from("codigos").delete().eq("id", id);
  },
  find: (codigo: string, tipo?: TipoEtiqueta): Codigo | undefined => {
    const code = codigo.trim();
    if (!code) return undefined;
    const user = cacheCodigos.find((c) => c.codigo.trim() === code);
    if (user) return user;
    return builtinsFor(tipo).find((b) => b.codigo === code);
  },
};

export const etiquetasStore = {
  list: () => [...cacheEtiquetas].sort((a, b) => b.createdAt - a.createdAt),
  add: (e: Omit<Etiqueta, "id" | "createdAt">) => {
    const item: Etiqueta = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
    cacheEtiquetas = [item, ...cacheEtiquetas];
    notify("etiquetas");
    void supabase.from("etiquetas").insert({ id: item.id, ...toRow(item) } as never);
    return item;
  },
  update: (id: string, patch: Partial<Omit<Etiqueta, "id" | "createdAt">>) => {
    cacheEtiquetas = cacheEtiquetas.map((e) => (e.id === id ? { ...e, ...patch } : e));
    notify("etiquetas");
    void supabase.from("etiquetas").update(toRow(patch) as never).eq("id", id);
    return cacheEtiquetas.find((e) => e.id === id);
  },
  remove: (id: string) => {
    cacheEtiquetas = cacheEtiquetas.filter((e) => e.id !== id);
    notify("etiquetas");
    void supabase.from("etiquetas").delete().eq("id", id);
  },
  get: (id: string) => cacheEtiquetas.find((e) => e.id === id),
};
