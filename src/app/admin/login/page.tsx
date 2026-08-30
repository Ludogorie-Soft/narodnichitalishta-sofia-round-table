import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session?.user && session.user.active !== false) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Администрация</h1>
      <p className="text-sm text-neutral-600">
        Вход само за съществуващи администратори. Няма публична регистрация.
      </p>
      <LoginForm />
    </main>
  );
}
