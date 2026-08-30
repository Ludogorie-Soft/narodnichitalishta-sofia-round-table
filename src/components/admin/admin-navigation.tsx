"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Табло" },
  { href: "/admin/general", label: "Общи настройки" },
  { href: "/admin/content", label: "Съдържание" },
  { href: "/admin/partners", label: "Партньори" },
  { href: "/admin/schedule", label: "Програма" },
  { href: "/admin/media", label: "Изображения" },
  { href: "/admin/users", label: "Потребители" },
  { href: "/admin/account", label: "Моята парола" },
];

export function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Администрация" className="grid gap-1">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-conference-green text-white"
                : mobile
                  ? "text-neutral-800 hover:bg-neutral-100"
                  : "text-white hover:bg-white/10 hover:text-white"
            }`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
