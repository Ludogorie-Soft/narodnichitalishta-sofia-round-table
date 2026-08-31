"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bg">
      <body className="bg-white text-[#333333]">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-5 py-16">
          <h1 className="text-3xl font-semibold">Нещо се обърка</h1>
          <p>
            Моля, опитайте отново. Ако проблемът продължи, свържете се с
            администратор.
          </p>
          <button
            onClick={reset}
            type="button"
            style={{
              width: "fit-content",
              borderRadius: "0.5rem",
              background: "#1f4d3a",
              color: "white",
              padding: "0.5rem 1rem",
              fontWeight: 700,
            }}
          >
            Опитай отново
          </button>
        </main>
      </body>
    </html>
  );
}
