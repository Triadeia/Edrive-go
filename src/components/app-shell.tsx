"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { navigation } from "@/lib/brand-data";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
              <input className="topbar-search h-9 w-full rounded-lg border border-transparent pl-9 pr-3 text-sm outline-none" placeholder="Buscar marca, movimento, documentos..." />
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
