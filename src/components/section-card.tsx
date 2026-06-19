import type { LucideIcon } from "lucide-react";

export function SectionCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
}) {
  return (
    <article className="soft-panel rounded-lg p-5">
      <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-electric/12 text-electric">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/58">{text}</p>
    </article>
  );
}
