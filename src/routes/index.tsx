import { createFileRoute, Link } from "@tanstack/react-router";
import { Tags, Archive, ScrollText, FileText, Search, Grid3x3, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Home — Sistemas de Arquivo da SEDOC" }] }),
  component: HomePage,
});

type Card = {
  to: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

const cards: Card[] = [
  {
    to: "/gerador",
    title: "GERADOR - ADM - PERMANENTE",
    desc: "Gere etiquetas para caixas de guarda permanente.",
    icon: Tags,
  },
  {
    to: "/gerador-intermediaria",
    title: "GERADOR - ADM - INTERMEDIÁRIO",
    desc: "Gere etiquetas para caixas de guarda intermediária.",
    icon: Tags,
  },
  {
    to: "/gerador-historico",
    title: "GERADOR - HISTÓRICO - PERMANENTE",
    desc: "Gere etiquetas para documentos históricos.",
    icon: Archive,
  },
  {
    to: "/certidoes",
    title: "GERADOR DE CERTIDÕES",
    desc: "Gere certidões de digitalização.",
    icon: ScrollText,
  },
  {
    to: "/codigos",
    title: "CADASTRO DE CÓDIGOS",
    desc: "Cadastre e gerencie códigos da tabela de temporalidade.",
    icon: FileText,
  },
  {
    to: "/mapa",
    title: "MAPA DE ORGANIZAÇÃO DE CAIXAS",
    desc: "Visualize corredores, estantes e vagas já etiquetadas.",
    icon: Grid3x3,
  },
  {
    to: "/historico",
    title: "HISTÓRICO & IMPRESSÃO",
    desc: "Consulte, edite e imprima as etiquetas geradas.",
    icon: Search,
  },
];

function HomePage() {
  return (
    <div className="space-y-4">
      <header className="glass rounded-2xl p-5">
        <h2 className="text-xl font-semibold tracking-tight">BEM-VINDO(A)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione uma das ferramentas abaixo para começar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="glass-strong rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-xl group"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center shadow-inner group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <c.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">
                {c.title}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {c.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
