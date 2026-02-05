import { type ReactNode } from "react";
import { clsx } from "clsx";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  fullWidth?: boolean;
}

export function Section({ children, className, id, fullWidth = false }: SectionProps) {
  return (
    <section id={id} className={clsx("py-12 md:py-16", className)}>
      {fullWidth ? (
        children
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          {children}
        </div>
      )}
    </section>
  );
}

interface SectionHeaderProps {
  tag?: string;
  title: string;
  highlight?: string;
  description?: string;
  centered?: boolean;
}

export function SectionHeader({ tag, title, highlight, description, centered = true }: SectionHeaderProps) {
  const titleParts = highlight ? title.split(highlight) : [title];

  return (
    <div className={clsx("mb-8 md:mb-12 w-full", centered && "text-center")}>
      {tag && (
        <span className="inline-block mb-4 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400">
          {tag}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-white break-words">
        {highlight ? (
          <>
            {titleParts[0]}
            {highlight}
            {titleParts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {description && (
        <p className={clsx("text-gray-400 text-lg max-w-2xl break-words", centered && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
