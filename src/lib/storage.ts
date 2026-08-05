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

/* ------------------------------------------------------------------ */
/* Status de sincronização (salvando / confirmado / erro / atualizado) */
/* ------------------------------------------------------------------ */

export type SyncState = "idle" | "saving" | "saved" | "error" | "realtime";
export type SyncStatus = { state: SyncState; message: string; at: number };

let syncStatus: SyncStatus = { state: "idle", message: "Sincronizado", at: Date.now() };
let pending = 0;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

export function getSyncStatus(): SyncStatus {
  return syncStatus;
}

export function subscribeSyncStatus(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("tre-sync-status", cb);
  return () => window.removeEventListener("tre-sync-status", cb);
}

function setSync(state: SyncState, message: string, autoIdleMs?: number) {
  syncStatus = { state, message, at: Date.now() };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tre-sync-status"));
    if (resetTimer) clearTimeout(resetTimer);
    if (autoIdleMs) {
      resetTimer = setTimeout(() => {
        if (pending === 0) setSync("idle", "Sincronizado");
      }, autoIdleMs);
    }
  }
}

/** Envolve uma escrita no banco para refletir o status na interface. */
function track<T extends { error: unknown } | void>(
  label: string,
  op: PromiseLike<T>,
): void {
  pending += 1;
  setSync("saving", `Salvando ${label}…`);
  void Promise.resolve(op).then(
    (res) => {
      pending -= 1;
      const err = res && typeof res === "object" ? (res as { error: unknown }).error : null;
      if (err) {
        const msg = (err as { message?: string }).message ?? "Falha ao salvar";
        setSync("error", `Erro ao salvar ${label}: ${msg}`);
      } else if (pending === 0) {
        setSync("saved", "Alterações salvas", 2500);
      }
    },
    (e: unknown) => {
      pending -= 1;
      setSync("error", `Erro ao salvar ${label}: ${(e as Error)?.message ?? "sem conexão"}`);
    },
  );
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

const MIGRATED_KEY = "tre_migrado_cloud_v1";

/** Envia uma única vez os dados antigos salvos no navegador para o banco compartilhado. */
async function migrateLocalStorageOnce() {
  try {
    if (localStorage.getItem(MIGRATED_KEY)) return;
    const codigos = JSON.parse(localStorage.getItem("tre_codigos_v1") ?? "[]") as Codigo[];
    const etiquetas = JSON.parse(localStorage.getItem("tre_etiquetas_v1") ?? "[]") as Etiqueta[];

    const novosCodigos = codigos
      .filter((c) => c?.codigo && !BUILTIN_CODES.has(String(c.codigo).trim()))
      .map((c) => ({
        codigo: String(c.codigo).trim(),
        descricao: c.descricao ?? "",
        prazo: c.prazo ?? null,
      }));
    if (novosCodigos.length) {
      await supabase.from("codigos").upsert(novosCodigos, { onConflict: "codigo" });
    }

    if (etiquetas.length) {
      const { count } = await supabase
        .from("etiquetas")
        .select("id", { count: "exact", head: true });
      if (!count) {
        await supabase.from("etiquetas").insert(
          etiquetas.map((e) => ({
            ...toRow(e),
            created_at: new Date(e.createdAt || Date.now()).toISOString(),
          })) as never,
        );
      }
    }

    localStorage.setItem(MIGRATED_KEY, "1");
  } catch {
    /* ignora falhas de migração */
  }
}

/** Carrega os dados do banco e mantém o cache sincronizado em tempo real. */
export function startRealtimeSync() {
  if (started || typeof window === "undefined") return;
  started = true;

  /** Busca todas as linhas em páginas (o banco devolve no máximo 1000 por consulta). */
  const fetchAll = async <T,>(table: "codigos" | "etiquetas"): Promise<T[] | null> => {
    const PAGE = 1000;
    const out: T[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) return out.length ? out : null;
      out.push(...((data ?? []) as T[]));
      if (!data || data.length < PAGE) break;
    }
    return out;
  };

  const loadCodigos = async () => {
    const data = await fetchAll<CodigoRow>("codigos");
    if (data) {
      cacheCodigos = data
        .filter((r) => !BUILTIN_CODES.has(r.codigo.trim()))
        .map(mapCodigo);
      notify("codigos");
    }
  };
  const loadEtiquetas = async () => {
    const data = await fetchAll<EtiquetaRow>("etiquetas");
    if (data) {
      cacheEtiquetas = data.map(mapEtiqueta);
      notify("etiquetas");
    }
  };

  void (async () => {
    await migrateLocalStorageOnce();
    await loadCodigos();
    await loadEtiquetas();
  })();

  supabase
    .channel("tre-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "codigos" },
      () => {
        setSync("realtime", "Atualizado por outro dispositivo", 2500);
        void loadCodigos();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "etiquetas" },
      () => {
        setSync("realtime", "Atualizado por outro dispositivo", 2500);
        void loadEtiquetas();
      },
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
