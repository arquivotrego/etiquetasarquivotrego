import type { Etiqueta as EtiquetaT } from "@/lib/storage";

export function Etiqueta({ data }: { data: Partial<EtiquetaT> }) {
  const codigos = data.codigos ?? [];
  const linhas = [0, 1, 2, 3].map((i) => codigos[i] ?? { codigo: "", descricao: "" });
  return (
    <div className="etiqueta">
      <div className="et-header">
        TRIBUNAL REGIONAL ELEITORAL DE GOIÁS
        <br />
        SEÇÃO DE GESTÃO DOCUMENTAL — SEDOC
      </div>

      <div className="et-row">
        <div className="et-cell">
          <div className="et-label">ANO DE PRODUÇÃO</div>
          <div className="et-value">{data.ano || "————"}</div>
        </div>
        <div className="et-cell">
          <div className="et-label">DESTINO / FINAL</div>
          <div className="et-value">{data.final || "————"}</div>
        </div>
      </div>

      <div className="et-row">
        <div className="et-cell et-check">
          <span className="box" />
          GUARDA
        </div>
        <div className="et-cell et-check">
          <span className="box" />
          PERMANENTE
        </div>
      </div>

      <div className="et-row">
        <div className="et-cell" style={{ flex: 1 }}>
          <div className="et-vaga">VAGA {data.vaga || "————"}</div>
        </div>
      </div>

      <div className="et-codigos">
        {linhas.map((l, i) => (
          <div key={i} className="et-codigo-line">
            {l.codigo ? `${l.codigo}${l.descricao ? "  —  " + l.descricao : ""}` : "\u00A0"}
          </div>
        ))}
      </div>

      <div className="et-desc">
        <div className="et-desc-title">Descrição:</div>
        <div>
          {codigos
            .filter((c) => c.descricao)
            .map((c) => c.descricao)
            .join(" • ")}
        </div>
      </div>
    </div>
  );
}
