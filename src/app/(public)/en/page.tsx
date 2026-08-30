import Link from "next/link";
import { BrandLogo } from "@/components/public/brand-logo";

export default function EnglishHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <p>
        <Link href="/" className="underline underline-offset-4">
          Български
        </Link>
      </p>
      <BrandLogo alt="Narodni Chitalishta Foundation logo" />
      <div>
        <p className="text-sm tracking-wide uppercase">
          18–19 September 2026 · Sofia
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          International conference
        </h1>
        <p className="mt-3 text-lg">
          Culture as a Catalyst for Local and Regional Development
        </p>
      </div>
      <p className="text-sm text-neutral-600">
        Temporary project foundation page. The full public site and admin panel
        follow in later phases.
      </p>
    </main>
  );
}
