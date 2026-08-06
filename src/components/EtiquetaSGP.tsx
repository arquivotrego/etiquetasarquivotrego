import type { Etiqueta as EtiquetaT } from "@/lib/storage";
import brasaoUrl from "@/assets/brasao-republica.jpg";

export function EtiquetaSGP({ data }: { data: Partial<EtiquetaT> }) {
  return (
    <div className="etiqueta etiqueta-sgp">
      <div className="sgp-head">
        <img src={brasaoUrl} alt="Brasão da República Federativa do Brasil" className="sgp-brasao" />
        <div className="sgp-org">TRIBUNAL REGIONAL ELEITORAL DE GOIÁS</div>
        <div className="sgp-org">ARQUIVO GERAL</div>
        <div className="sgp-org">SEREF</div>
      </div>

      <div className="sgp-main">
        <div className="sgp-local">{data.local || ""}</div>
        <div className="sgp-tipo">{data.tipoDoc || ""}</div>
        <div className="sgp-letra">LETRA {data.letra || ""}</div>
      </div>

      <div className="sgp-funcao">FUNÇÃO</div>
      <div className="sgp-funcao-sub">02 GESTÃO DE PESSOAS</div>

      <div className="sgp-doc">
        <div>
          Código do documento: <b>02.09.03</b>
        </div>
        <div>
          Descrição do Documento: <b>Dossiê funcional de servidor.</b>
        </div>
      </div>

      <div className="sgp-prazo-title">PRAZO LIMITE</div>
      <div className="sgp-prazo">
        <div className="sgp-prazo-cell">
          <b>CORRENTE</b>
          <span>05 ANOS</span>
        </div>
        <div className="sgp-prazo-cell">
          <b>INTERMEDIÁRIO</b>
          <span>100 ANOS</span>
        </div>
        <div className="sgp-prazo-cell">
          <b>DESTINO FINAL</b>
          <span>ELIMINAÇÃO</span>
        </div>
      </div>

      <div className="sgp-footer">Programa de Gestão Documental - CPAD</div>
    </div>
  );
}
