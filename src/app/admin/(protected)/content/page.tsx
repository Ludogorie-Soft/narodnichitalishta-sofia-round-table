import { listAdminContentSections } from "@/lib/admin-content";
import { requireAdminSession } from "@/lib/session";
import { ContentSectionForm } from "./content-section-form";

export default async function ContentPage() {
  await requireAdminSession();
  const sections = await listAdminContentSections();

  return (
    <main className="flex flex-col gap-8" id="main-content" tabIndex={-1}>
      <div>
        <h1 className="font-display text-3xl font-semibold">Съдържание</h1>
        <p className="mt-2 max-w-3xl text-neutral-600">
          Редактирайте заглавията и текстовете на публичните секции. Българската
          и английската версия се запазват заедно след изрично потвърждение.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <ContentSectionForm key={section.id} section={section} />
        ))}
      </div>
    </main>
  );
}
