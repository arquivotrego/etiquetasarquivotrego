import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Tags, Search, Moon, Sun, ScrollText, Archive, Home, Grid3x3, Menu, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { TreLogo } from "./TreLogo";

import { SyncIndicator } from "./SyncIndicator";

const THEME_KEY = "tre_theme";
type Theme = "light" | "dark";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);
  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };
  return [theme, toggle];
}

const nav: { to: string; label: string; short: string; icon: LucideIcon }[] = [
  { to: "/", label: "HOME", short: "HOME", icon: Home },
  { to: "/gerador", label: "GERADOR - ADM - PERMANENTE", short: "PERMANENTE", icon: Tags },
  { to: "/gerador-intermediaria", label: "GERADOR - ADM - INTERMEDIÁRIO", short: "INTERMEDIÁRIO", icon: Tags },
  { to: "/gerador-historico", label: "GERADOR - HISTÓRICO - PERMANENTE", short: "HISTÓRICO", icon: Archive },
  { to: "/gerador-sgp", label: "GERADOR - SGP - PERMANENTE", short: "SGP", icon: Tags },

  { to: "/certidoes", label: "GERADOR DE CERTIDÕES", short: "CERTIDÕES", icon: ScrollText },
  { to: "/codigos", label: "CADASTRO DE CÓDIGOS", short: "CÓDIGOS", icon: FileText },
  { to: "/mapa", label: "MAPA DE CAIXAS", short: "MAPA", icon: Grid3x3 },
  { to: "/historico", label: "HISTÓRICO & IMPRESSÃO", short: "IMPRESSÃO", icon: Search },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="app-bg no-print"><span /></div>

      {/* Header */}
      <header className="no-print sticky top-0 z-30">
        <div className="glass-strong mx-2 mt-2 sm:mx-3 sm:mt-3 rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="md:hidden h-10 w-10 rounded-xl glass-input grid place-items-center text-foreground shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:grid h-11 w-11 rounded-xl bg-white/70 place-items-center shadow-inner shrink-0">
              <TreLogo size={36} />
            </div>
          </div>
          <div className="min-w-0 text-center">
            <h1 className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate">
              SISTEMAS DE ARQUIVO DA SEDOC
            </h1>
            <p className="hidden sm:block text-[11px] sm:text-xs text-muted-foreground truncate">
              Tribunal Regional Eleitoral de Goiás · SEDOC
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <SyncIndicator />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              title={theme === "dark" ? "Tema claro" : "Tema escuro"}
              className="h-10 w-10 rounded-xl glass-input grid place-items-center hover:bg-white/80 transition text-foreground shrink-0"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center">
              <TreLogo size={52} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-3 p-2 sm:p-3">
        {/* Sidebar (desktop) */}
        <aside className="no-print w-60 shrink-0 hidden md:block">
          <nav className="glass rounded-2xl p-3 sticky top-24 space-y-1">
            {nav.map((item) => {
              const active = path === item.to || path.startsWith(item.to + "/");
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

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-50 no-print">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <nav className="absolute inset-y-0 left-0 w-[82vw] max-w-[320px] glass-strong border-r border-white/20 p-3 overflow-y-auto space-y-1 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between px-2 py-2 mb-1">
                <span className="text-sm font-semibold">MENU</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="h-9 w-9 rounded-xl glass-input grid place-items-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {nav.map((item) => {
                const active = path === item.to || path.startsWith(item.to + "/");
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground/80 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 min-w-0 pb-3">{children}</main>
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
