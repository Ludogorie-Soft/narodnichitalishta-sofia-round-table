import { listAdministrators } from "@/lib/admin-users";
import { requireAdminSession } from "@/lib/session";
import { CreateUserForm, UserRowActions } from "./user-forms";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const people = await listAdministrators();

  return (
    <main className="flex flex-col gap-10" id="main-content" tabIndex={-1}>
      <div>
        <h1 className="text-2xl font-semibold">Потребители</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Всички акаунти имат едно и също ниво на права. Няма публична
          регистрация.
        </p>
      </div>

      <CreateUserForm />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 pr-4">Име</th>
              <th className="py-2 pr-4">Имейл</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr
                key={person.id}
                className="border-b border-neutral-100 align-top"
              >
                <td className="py-3 pr-4">{person.name}</td>
                <td className="py-3 pr-4">{person.email}</td>
                <td className="py-3 pr-4">
                  {person.active ? "Активен" : "Деактивиран"}
                </td>
                <td className="py-3">
                  <UserRowActions
                    person={person}
                    currentUserId={session.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
