import { requireAdminSession } from "@/lib/session";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  await requireAdminSession();

  return (
    <main className="flex flex-col gap-4" id="main-content" tabIndex={-1}>
      <h1 className="text-2xl font-semibold">Смяна на парола</h1>
      <ChangePasswordForm />
    </main>
  );
}
