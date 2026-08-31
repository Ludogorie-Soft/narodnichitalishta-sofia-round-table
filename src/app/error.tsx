"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col justify-center gap-4 px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Нещо се обърка</h1>
      <p className="text-neutral-700">
        Моля, опитайте отново. Ако проблемът продължи, свържете се с
        администратор.
      </p>
      <button
        className="w-fit rounded-lg bg-conference-green px-4 py-2 text-sm font-bold text-white"
        onClick={reset}
        type="button"
      >
        Опитай отново
      </button>
    </main>
  );
}
