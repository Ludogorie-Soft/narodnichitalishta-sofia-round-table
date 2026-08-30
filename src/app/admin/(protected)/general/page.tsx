import { getAdminSettings } from "@/lib/admin-settings";
import { requireAdminSession } from "@/lib/session";
import { GeneralForm } from "./general-form";

export default async function GeneralPage() {
  await requireAdminSession();
  const settings = await getAdminSettings();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Общи настройки</h1>
        <p className="mt-2 text-neutral-600">
          Дати, място, публични връзки и съдържание в долната част на сайта.
        </p>
      </div>
      <GeneralForm settings={settings} />
    </main>
  );
}
