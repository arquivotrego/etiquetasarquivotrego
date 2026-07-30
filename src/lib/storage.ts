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
export type TipoEtiqueta = "permanente" | "intermediaria" | "historico";
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
  createdAt: number;
};

const KEY_CODIGOS = "tre_codigos_v1";
const KEY_ETIQUETAS = "tre_etiquetas_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("tre-storage", { detail: { key } }));
}

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

function readUser(): Codigo[] {
  const raw = read<Codigo[]>(KEY_CODIGOS, []);
  // Remove códigos personalizados que duplicam algum código dos PDFs (GP/GI)
  const filtered = raw.filter((c) => !BUILTIN_CODES.has(c.codigo.trim()));
  if (typeof window !== "undefined" && filtered.length !== raw.length) {
    localStorage.setItem(KEY_CODIGOS, JSON.stringify(filtered));
  }
  return filtered.map((c) => ({ ...c, origem: "USER" as Origem }));
}

function builtinsFor(tipo?: TipoEtiqueta): Codigo[] {
  if (tipo === "intermediaria") return BUILTIN_GI;
  if (tipo === "permanente") return BUILTIN_GP;
  return [...BUILTIN_GP, ...BUILTIN_GI];
}

export const codigosStore = {
  list: (tipo?: TipoEtiqueta): Codigo[] => {
    const user = readUser();
    const merged = [...builtinsFor(tipo), ...user];
    return merged.sort((a, b) => a.codigo.localeCompare(b.codigo, "pt-BR", { numeric: true }));
  },
  listUser: () => readUser(),
  add: (codigo: string, descricao: string, prazo?: number) => {
    const list = read<Codigo[]>(KEY_CODIGOS, []);
    const exists = list.find((c) => c.codigo === codigo);
    if (exists) {
      exists.descricao = descricao;
      if (prazo !== undefined) exists.prazo = prazo;
      write(KEY_CODIGOS, list);
      return exists;
    }
    const item: Codigo = { id: crypto.randomUUID(), codigo, descricao, prazo };
    write(KEY_CODIGOS, [...list, item]);
    return item;
  },
  remove: (id: string) => {
    write(KEY_CODIGOS, read<Codigo[]>(KEY_CODIGOS, []).filter((c) => c.id !== id));
  },
  find: (codigo: string, tipo?: TipoEtiqueta): Codigo | undefined => {
    const code = codigo.trim();
    if (!code) return undefined;
    const user = readUser().find((c) => c.codigo.trim() === code);
    if (user) return user;
    return builtinsFor(tipo).find((b) => b.codigo === code);
  },
};

export const etiquetasStore = {
  list: () =>
    read<Etiqueta[]>(KEY_ETIQUETAS, []).sort((a, b) => b.createdAt - a.createdAt),
  add: (e: Omit<Etiqueta, "id" | "createdAt">) => {
    const item: Etiqueta = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
    write(KEY_ETIQUETAS, [item, ...etiquetasStore.list()]);
    return item;
  },
  update: (id: string, patch: Partial<Omit<Etiqueta, "id" | "createdAt">>) => {
    const list = etiquetasStore.list().map((e) => (e.id === id ? { ...e, ...patch } : e));
    write(KEY_ETIQUETAS, list);
    return list.find((e) => e.id === id);
  },
  remove: (id: string) => {
    write(
      KEY_ETIQUETAS,
      etiquetasStore.list().filter((e) => e.id !== id),
    );
  },
  get: (id: string) => etiquetasStore.list().find((e) => e.id === id),
};

export function useStorageVersion() {
  return { KEY_CODIGOS, KEY_ETIQUETAS };
}
