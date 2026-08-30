import { requireAdminSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Табло</h1>
      <p>
        Здравейте, {session.user.name}. Съдържанието, програмата и медиите ще се
        редактират оттук в следващите фази.
      </p>
    </main>
  );
}
