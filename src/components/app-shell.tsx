"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { navigation } from "@/lib/brand-data";
import { documents } from "@/lib/document-catalog";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

const staticSearchItems = [
  { href: "/app/dashboard", title: "Visao geral", group: "Painel", description: "Resumo da marca, movimento e acervo." },
  { href: "/app/tarefas", title: "Tarefas", group: "Operacao", description: "Lista, kanban, calendario e API de tarefas." },
  { href: "/app/marca", title: "Brandbook eDrive", group: "Marca", description: "Guidelines, logomarcas, paleta, voz e aplicacoes." },
  { href: "/app/marca/diretorio", title: "Diretorio", group: "Marca", description: "Mapa das paginas e capitulos do sistema." },
  { href: "/app/marca/documentos", title: "Documentos", group: "Acervo", description: "Biblioteca completa publicada." },
  { href: "/app/movimento", title: "Movimento", group: "Movimento", description: "Manifesto do Motorista Livre e rituais." },
  { href: "/app/primal-branding", title: "Primal Branding", group: "Sistema", description: "Creed, icones, rituais, palavras sagradas e lideranca." },
  { href: "/app/inteligencia-cliente", title: "Inteligencia do Cliente", group: "Cliente", description: "ICPs, voz do cliente e TAM/SAM/SOM." },
];

const searchItems = [
  ...staticSearchItems,
  ...documents.map((document) => ({
    href: `/app/marca/documentos/${document.id}`,
    title: document.title,
    group: document.category,
    description: document.description,
  })),
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const searchResults = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return [];
    return searchItems
      .filter((item) => [item.title, item.group, item.description].join(" ").toLocaleLowerCase("pt-BR").includes(term))
      .slice(0, 7);
  }, [search]);

  function submitSearch() {
    const first = searchResults[0];
    if (first) window.location.href = first.href;
  }

  function closeSearch() {
    setSearch("");
    setSearchFocused(false);
  }

  return (
    <div className="min-h-screen">
      <aside className={cn("app-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-5 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-7 flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-12 place-items-center rounded-lg border border-white/10 bg-white/6">
              <Image src="/brand/icone-branco.svg" width={30} height={30} alt="" />
            </span>
            <span>
              <span className="block text-sm font-black">eDrive Go</span>
              <span className="sidebar-muted block text-[11px]">Painel de marca</span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X className="size-5" /></button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1" aria-label="Navegacao principal">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="sidebar-label mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em]">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn("sidebar-link flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition", active && "is-active")}
                    >
                      <item.icon className="size-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black text-white">Nao e locadora.</p>
          <p className="sidebar-muted mt-2 text-xs leading-relaxed">Infraestrutura de mobilidade eletrica para motoristas da nova geracao.</p>
        </div>
      </aside>

      {open ? <button className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar navegacao" /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
          <div className="topbar mx-auto flex h-16 max-w-[1500px] items-center gap-3 rounded-lg px-4">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="size-5" /></button>
            <div className="relative hidden max-w-lg flex-1 sm:block">
              <Search className="muted absolute left-3 top-2.5 size-4" />
              <input
                className="topbar-search h-9 w-full rounded-lg border border-transparent pl-9 pr-9 text-sm outline-none"
                placeholder="Buscar marca, movimento, documentos..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                  if (event.key === "Escape") closeSearch();
                }}
              />
              {search ? (
                <button onClick={closeSearch} className="muted absolute right-2 top-2 grid size-5 place-items-center rounded-md hover:bg-[var(--muted)]" aria-label="Limpar busca">
                  <X className="size-3.5" />
                </button>
              ) : null}
              {searchFocused && search.trim() ? (
                <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-black/30">
                  {searchResults.length ? (
                    searchResults.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeSearch} className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-3 last:border-b-0 hover:bg-[var(--muted)]">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">{item.title}</span>
                          <span className="muted mt-0.5 block truncate text-xs">{item.group} · {item.description}</span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-[var(--primary)]" />
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-sm font-bold text-[var(--muted-foreground)]">Nenhum resultado encontrado.</div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-2 text-xs font-black text-[var(--primary)] sm:inline-flex">
                <span className="size-2 rounded-full bg-[var(--primary)]" />
                sistema publicado
              </span>
              <ThemeSwitcher compact />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
