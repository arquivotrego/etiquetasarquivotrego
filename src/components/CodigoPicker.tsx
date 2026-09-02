import { useMemo, useRef, useState, useEffect } from "react";

export type CodigoItem = {
  id: string;
  codigo: string;
  descricao: string;
  prazo?: number | null;
};

type Props = {
  index: number;
  items: CodigoItem[];
  codigo: string;
  descricao: string;
  onChange: (v: { codigo: string; descricao: string }) => void;
};

/**
 * Campos de Código + Descrição com sugestões próprias (não usa <datalist>),
 * garantindo que ao clicar numa sugestão o par código/descrição escolhido
 * seja exatamente o aplicado, mesmo com códigos ou descrições duplicadas.
 */
export function CodigoPicker({ index, items, codigo, descricao, onChange }: Props) {
  const [open, setOpen] = useState<null | "codigo" | "descricao">(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const sugestoes = useMemo(() => {
    const campo = open === "descricao" ? descricao : codigo;
    const q = campo.trim().toLowerCase();
    const base = q
      ? items.filter((c) =>
          open === "descricao"
            ? c.descricao.toLowerCase().includes(q)
            : c.codigo.toLowerCase().includes(q),
        )
      : items;
    return base.slice(0, 60);
  }, [items, open, codigo, descricao]);

  function pick(item: CodigoItem) {
    onChange({ codigo: item.codigo, descricao: item.descricao });
    setOpen(null);
  }

  return (
    <div ref={wrapRef} className="relative grid sm:grid-cols-[160px_1fr] gap-3">
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground block mb-1.5">
          {`Código ${index + 1}${index === 0 ? " *" : ""}`}
        </span>
        <input
          value={codigo}
          onFocus={() => setOpen("codigo")}
          onChange={(e) => {
            setOpen("codigo");
            onChange({ codigo: e.target.value, descricao });
          }}
          className="ios-input font-mono"
          placeholder="13.32"
          autoComplete="off"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground block mb-1.5">Descrição</span>
        <input
          value={descricao}
          onFocus={() => setOpen("descricao")}
          onChange={(e) => {
            setOpen("descricao");
            onChange({ codigo, descricao: e.target.value });
          }}
          className="ios-input"
          placeholder="REGISTRO DE CANDIDATURA"
          autoComplete="off"
        />
      </label>

      {open && sugestoes.length > 0 && (
        <div
          className="absolute z-40 top-full mt-1 left-0 right-0 max-h-72 overflow-auto rounded-xl border border-white/20 bg-background/85 backdrop-blur-xl shadow-xl"
          role="listbox"
        >
          {sugestoes.map((c) => (
            <button
              key={c.id + c.codigo + c.descricao}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition flex gap-2"
            >
              <span className="font-mono text-primary shrink-0">{c.codigo}</span>
              <span className="text-muted-foreground truncate">{c.descricao}</span>
              {c.prazo ? (
                <span className="ml-auto text-xs text-muted-foreground shrink-0">{c.prazo} anos</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
