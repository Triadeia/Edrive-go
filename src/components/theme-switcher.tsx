"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { themes, type ThemeId } from "@/lib/brand-data";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<ThemeId>("night");

  useEffect(() => {
    const stored = window.localStorage.getItem("libert-theme") as ThemeId | null;
    const initial = stored && themes.some((item) => item.id === stored) ? stored : "night";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function chooseTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("libert-theme", nextTheme);
  }

  return (
    <div className="theme-switcher" role="group" aria-label="Tema da interface">
      {themes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="theme-option"
          aria-pressed={id === theme}
          onClick={() => chooseTheme(id)}
          title={`Usar modo ${label.toLowerCase()}`}
        >
          <Icon className="size-4" aria-hidden="true" />
          {!compact ? <span>{label}</span> : null}
          {id === theme ? <Check className="size-3" aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
  );
}
