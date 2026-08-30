import { getAdminPartnersData } from "@/lib/admin-partners";
import { requireAdminSession } from "@/lib/session";
import { PartnerForm } from "./partner-form";

export default async function PartnersPage() {
  await requireAdminSession();
  const data = await getAdminPartnersData();

  return (
    <main className="space-y-8" id="main-content" tabIndex={-1}>
      <div>
        <h1 className="font-display text-3xl font-semibold">Партньори</h1>
        <p className="mt-2 text-neutral-600">
          Лога, връзки, видимост и ред на партньорите.
        </p>
      </div>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold">
          Нов партньор
        </h2>
        <PartnerForm media={data.media} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">
          Публикувани записи
        </h2>
        {data.partners.map((partner, index) => (
          <PartnerForm
            first={index === 0}
            key={partner.id}
            last={index === data.partners.length - 1}
            media={data.media}
            partner={partner}
          />
        ))}
      </section>
    </main>
  );
}
