"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { coreNavigation } from "@/lib/brand-data";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-night text-mist">
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-night/95 p-5 backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-8 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-12 place-items-center rounded-lg border border-electric/30 bg-electric/10">
              <Image src="/brand/icone-branco.svg" width={28} height={28} alt="" />
            </span>
            <span>
              <span className="block text-sm font-extrabold">eDrive Go</span>
              <span className="block text-[11px] text-white/46">Motorista Livre OS</span>
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-electric/20 bg-electric/10 p-4">
          <p className="kicker">Modulo 01</p>
          <p className="mt-2 text-sm font-bold leading-snug">Branding, movimento e inteligencia do cliente.</p>
        </div>

        <nav className="space-y-2" aria-label="Navegacao principal">
          {coreNavigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-white/58 transition hover:bg-white/7 hover:text-white",
                  active && "border border-electric/28 bg-electric/12 text-white shadow-glow",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-bold text-white">Nao e locadora.</p>
          <p className="mt-1 text-xs leading-relaxed text-white/48">E a nova infraestrutura de mobilidade eletrica para motoristas da nova geracao.</p>
        </div>
      </aside>

      {open ? <button className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar navegacao" /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-night/76 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1480px] items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
              <Menu className="size-5" />
            </button>
            <div className="hidden h-10 w-full max-w-md items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white/40 sm:flex">
              <Search className="size-4" />
              <span className="text-xs">Buscar em marca, movimento e cliente...</span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs font-bold text-white/52">
              <span className="size-2 rounded-full bg-electric shadow-[0_0_18px_rgba(0,200,150,.9)]" />
              Ecossistema ativo
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
