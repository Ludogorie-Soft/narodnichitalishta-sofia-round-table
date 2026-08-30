import type { ReactNode } from "react";

export function SkipLink({
  children,
  href = "#main-content",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-conference-green focus:shadow-lg"
      href={href}
    >
      {children}
    </a>
  );
}
