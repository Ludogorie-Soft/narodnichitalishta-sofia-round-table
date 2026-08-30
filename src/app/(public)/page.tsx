import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <p>
        <Link href="/en" className="underline underline-offset-4">
          English
        </Link>
      </p>
      <BrandLogo alt="Лого на Фондация „Народни читалища“" />
      <div>
        <p className="text-sm tracking-wide uppercase">
          18–19 септември 2026 · София
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          Международна конференция
        </h1>
        <p className="mt-3 text-lg">
          Културата като катализатор за местно и регионално развитие
        </p>
      </div>
      <p className="text-sm text-neutral-600">
        Временно съдържание на основата на проекта. Пълната страница и
        административният панел следват в следващите фази.
      </p>
    </main>
  );
}
