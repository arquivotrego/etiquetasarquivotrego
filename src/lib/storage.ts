export type Codigo = { id: string; codigo: string; descricao: string };
export type TipoEtiqueta = "permanente" | "intermediaria";
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

export const codigosStore = {
  list: () => read<Codigo[]>(KEY_CODIGOS, []),
  add: (codigo: string, descricao: string) => {
    const list = codigosStore.list();
    const exists = list.find((c) => c.codigo === codigo);
    if (exists) {
      exists.descricao = descricao;
      write(KEY_CODIGOS, list);
      return exists;
    }
    const item: Codigo = { id: crypto.randomUUID(), codigo, descricao };
    write(KEY_CODIGOS, [...list, item]);
    return item;
  },
  remove: (id: string) => {
    write(
      KEY_CODIGOS,
      codigosStore.list().filter((c) => c.id !== id),
    );
  },
  find: (codigo: string) =>
    codigosStore.list().find((c) => c.codigo.trim() === codigo.trim()),
};

export const etiquetasStore = {
  list: () =>
    read<Etiqueta[]>(KEY_ETIQUETAS, []).sort((a, b) => b.createdAt - a.createdAt),
  add: (e: Omit<Etiqueta, "id" | "createdAt">) => {
    const item: Etiqueta = { ...e, id: crypto.randomUUID(), createdAt: Date.now() };
    write(KEY_ETIQUETAS, [item, ...etiquetasStore.list()]);
    return item;
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
  // simple subscribe helper for components
  return { KEY_CODIGOS, KEY_ETIQUETAS };
}
