import type { Etiqueta as EtiquetaT } from "@/lib/storage";
import logoUrl from "@/assets/tre-go-logo.png";

export function Etiqueta({ data }: { data: Partial<EtiquetaT> }) {
  const codigos = data.codigos ?? [];
  const cells = [0, 1, 2, 3].map((i) => codigos[i]?.codigo ?? "");
  const descricao = codigos
    .filter((c) => c.descricao)
    .map((c) => c.descricao)
    .join(" / ");

  return (
    <div className="etiqueta">
      {/* TOP: logo + meta grid */}
      <div className="et-top">
        <div className="et-logo">
          <img src={logoUrl} alt="TRE-GO" />
        </div>
        <div className="et-meta">
          <div className="et-meta-row et-ano">
            ANO DE PRODUÇÃO&nbsp;&nbsp;{data.ano || ""}
          </div>
          <div className="et-meta-row et-split">
            <div className="et-half">DESTINO</div>
            <div className="et-half">FINAL</div>
          </div>
          <div className="et-meta-row et-split et-guarda">
            <div className="et-half">GUARDA<br/>PERMANENTE</div>
            <div className="et-half et-final-year">{data.final || ""}</div>
          </div>
        </div>
      </div>

      {/* Gray title bands */}
      <div className="et-band">TRIBUNAL REGIONAL ELEITORAL DE GOIÁS</div>
      <div className="et-band">SEÇÃO DE GESTÃO DOCUMENTAL - SEDOC</div>

      {/* VAGA */}
      <div className="et-vaga-box">
        <div className="et-vaga-label">VAGA</div>
        <div className="et-vaga-num">{data.vaga || ""}</div>
      </div>

      {/* Códigos row */}
      <div className="et-cods">
        <div className="et-cods-label">Códigos:</div>
        {cells.map((c, i) => (
          <div key={i} className="et-cods-cell">{c}</div>
        ))}
      </div>

      {/* Descrição */}
      <div className="et-descricao">
        <b>Descrição :</b> {descricao}{descricao ? " | GP" : ""}
      </div>
    </div>
  );
}
