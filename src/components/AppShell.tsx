import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Tags, Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TreLogo } from "./TreLogo";

const nav: { to: string; label: string; short: string; icon: LucideIcon }[] = [
  { to: "/gerador", label: "Etiquetas - Guarda Permanente", short: "Permanente", icon: Tags },
  { to: "/gerador-intermediaria", label: "Etiquetas - Guarda Intermediária", short: "Intermediária", icon: Tags },
  { to: "/codigos", label: "Cadastro de Códigos", short: "Códigos", icon: FileText },
  { to: "/historico", label: "Histórico & Impressão", short: "Histórico", icon: Search },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex flex-col">
      <div className="app-bg no-print"><span /></div>

      {/* Header */}
      <header className="no-print sticky top-0 z-30">
        <div className="glass-strong mx-3 mt-3 rounded-2xl px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-white/70 grid place-items-center shadow-inner">
              <TreLogo size={36} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                Sistema de Etiquetas — Arquivo Morto
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Tribunal Regional Eleitoral de Goiás · SEDOC
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <TreLogo size={52} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-3 p-3">
        {/* Sidebar */}
        <aside className="no-print w-60 shrink-0 hidden md:block">
          <nav className="glass rounded-2xl p-3 sticky top-24 space-y-1">
            {nav.map((item) => {
              const active = path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground/80 hover:bg-white/60",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 no-print">
          <div className="glass-strong rounded-2xl p-2 flex justify-around">
            {nav.map((item) => {
              const active = path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px]",
                    active ? "bg-primary text-primary-foreground" : "text-foreground/70",
                  ].join(" ")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.short}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 min-w-0 pb-24 md:pb-3">{children}</main>
      </div>

      {/* Footer */}
      <footer className="no-print px-4 pb-3">
        <div className="glass rounded-2xl px-4 py-2.5 text-center text-[11px] text-muted-foreground">
          Tribunal Regional Eleitoral de Goiás — TRE-GO · Seção de Gestão Documental — SEDOC · Sistema de Organização de Arquivos
        </div>
      </footer>
    </div>
  );
}
