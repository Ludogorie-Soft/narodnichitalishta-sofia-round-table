import { getAdminScheduleData } from "@/lib/admin-schedule";
import { requireAdminSession } from "@/lib/session";
import {
  DayForm,
  DeleteControl,
  ItemForm,
  OrderControls,
  PanelForm,
  SpeakerForm,
} from "./schedule-forms";

export default async function SchedulePage() {
  await requireAdminSession();
  const data = await getAdminScheduleData();

  return (
    <main className="space-y-10" id="main-content" tabIndex={-1}>
      <div>
        <h1 className="font-display text-3xl font-semibold">Програма</h1>
        <p className="mt-2 max-w-3xl text-neutral-600">
          Дни, панели, сесии и говорители. Всяко запазване се публикува веднага.
        </p>
      </div>

      {data.warnings.length ? (
        <section
          aria-labelledby="schedule-warnings"
          className="rounded-xl border border-amber-300 bg-amber-50 p-5"
        >
          <h2 className="font-semibold" id="schedule-warnings">
            Предупреждения за застъпване
          </h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {data.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-5">
        <summary className="cursor-pointer font-bold">Добави нов ден</summary>
        <div className="mt-5">
          <DayForm />
        </div>
      </details>

      <section className="space-y-8" aria-label="Дни от програмата">
        {data.days.map((day, dayIndex) => {
          const dayPanels = data.panels.filter(
            (panel) => panel.dayId === day.id,
          );
          const ungrouped = data.items.filter(
            (item) => item.dayId === day.id && !item.panelId,
          );

          return (
            <article
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
              key={day.id}
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="mr-auto">
                  <p className="text-sm text-neutral-500">{day.date}</p>
                  <h2 className="font-display text-2xl font-semibold">
                    {day.titleBg || day.titleEn || "Ден без заглавие"}
                  </h2>
                </div>
                <OrderControls
                  entity="day"
                  first={dayIndex === 0}
                  id={day.id}
                  last={dayIndex === data.days.length - 1}
                />
              </div>

              <details className="mt-5 rounded-xl bg-neutral-50 p-4">
                <summary className="cursor-pointer font-semibold">
                  Редактирай деня
                </summary>
                <div className="mt-5">
                  <DayForm day={day} />
                  <div className="mt-4 border-t pt-4">
                    <DeleteControl entity="day" id={day.id} />
                    <p className="mt-2 text-xs text-neutral-500">
                      Изтриването на ден премахва неговите панели и сесии.
                    </p>
                  </div>
                </div>
              </details>

              <div className="mt-7 space-y-5">
                {dayPanels.map((panel, panelIndex) => {
                  const panelItems = data.items.filter(
                    (item) => item.panelId === panel.id,
                  );
                  return (
                    <section
                      className="rounded-xl border border-neutral-200 p-4"
                      key={panel.id}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="mr-auto font-semibold">
                          {panel.startTime.slice(0, 5)}–
                          {panel.endTime.slice(0, 5)}{" "}
                          {panel.titleBg || panel.titleEn}
                        </h3>
                        <OrderControls
                          entity="panel"
                          first={panelIndex === 0}
                          id={panel.id}
                          last={panelIndex === dayPanels.length - 1}
                        />
                      </div>
                      <details className="mt-3 bg-neutral-50 p-3">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Редактирай панела
                        </summary>
                        <div className="mt-4">
                          <PanelForm days={data.days} panel={panel} />
                          <div className="mt-4">
                            <DeleteControl entity="panel" id={panel.id} />
                          </div>
                        </div>
                      </details>
                      <div className="mt-4 space-y-3">
                        {panelItems.map((item, index) => (
                          <ScheduleItemCard
                            data={data}
                            first={index === 0}
                            item={item}
                            key={item.id}
                            last={index === panelItems.length - 1}
                          />
                        ))}
                        <details className="rounded-lg border border-dashed p-3">
                          <summary className="cursor-pointer text-sm font-semibold">
                            Добави сесия в панела
                          </summary>
                          <div className="mt-4">
                            <ItemForm
                              days={data.days}
                              defaultDayId={day.id}
                              defaultPanelId={panel.id}
                              items={data.items}
                              panels={data.panels}
                              speakers={data.speakers}
                            />
                          </div>
                        </details>
                      </div>
                    </section>
                  );
                })}

                <section className="rounded-xl border border-neutral-200 p-4">
                  <h3 className="font-semibold">Сесии извън панел</h3>
                  <div className="mt-4 space-y-3">
                    {ungrouped.map((item, index) => (
                      <ScheduleItemCard
                        data={data}
                        first={index === 0}
                        item={item}
                        key={item.id}
                        last={index === ungrouped.length - 1}
                      />
                    ))}
                    <details className="rounded-lg border border-dashed p-3">
                      <summary className="cursor-pointer text-sm font-semibold">
                        Добави самостоятелна сесия
                      </summary>
                      <div className="mt-4">
                        <ItemForm
                          days={data.days}
                          defaultDayId={day.id}
                          items={data.items}
                          panels={data.panels}
                          speakers={data.speakers}
                        />
                      </div>
                    </details>
                  </div>
                </section>

                <details className="rounded-xl border border-dashed p-4">
                  <summary className="cursor-pointer font-semibold">
                    Добави панел
                  </summary>
                  <div className="mt-4">
                    <PanelForm days={[day]} />
                  </div>
                </details>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Говорители</h2>
          <p className="text-sm text-neutral-600">
            Говорител не може да бъде изтрит, докато участва в сесия.
          </p>
        </div>
        <details className="rounded-xl border-2 border-dashed bg-white p-4">
          <summary className="cursor-pointer font-semibold">
            Добави говорител
          </summary>
          <div className="mt-4">
            <SpeakerForm />
          </div>
        </details>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.speakers.map((speaker) => (
            <details
              className="rounded-xl border border-neutral-200 bg-white p-4"
              key={speaker.id}
            >
              <summary className="cursor-pointer font-semibold">
                {speaker.nameBg || speaker.nameEn}
              </summary>
              <div className="mt-4">
                <SpeakerForm speaker={speaker} />
                <div className="mt-4 border-t pt-4">
                  <DeleteControl entity="speaker" id={speaker.id} />
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function ScheduleItemCard({
  item,
  data,
  first,
  last,
}: {
  item: Awaited<ReturnType<typeof getAdminScheduleData>>["items"][number];
  data: Awaited<ReturnType<typeof getAdminScheduleData>>;
  first: boolean;
  last: boolean;
}) {
  return (
    <details className="rounded-lg bg-neutral-50 p-3">
      <summary className="cursor-pointer">
        <span className="font-mono text-xs">
          {item.startTime?.slice(0, 5) ?? "—"}
        </span>{" "}
        <span className="font-semibold">{item.titleBg || item.titleEn}</span>
      </summary>
      <div className="mt-3 flex justify-end">
        <OrderControls entity="item" first={first} id={item.id} last={last} />
      </div>
      <div className="mt-4">
        <ItemForm
          days={data.days}
          item={item}
          items={data.items}
          panels={data.panels}
          speakers={data.speakers}
        />
        <div className="mt-4 border-t pt-4">
          <DeleteControl entity="item" id={item.id} />
        </div>
      </div>
    </details>
  );
}
