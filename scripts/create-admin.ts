import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { config } from "dotenv";
import { MIN_ADMIN_PASSWORD_LENGTH } from "../src/lib/permissions";

config({ path: ".env.local" });
config();

async function main() {
  const { createAdministrator } = await import("../src/lib/admin-users");
  const rl = createInterface({ input, output });

  try {
    const email = await rl.question("Email: ");
    const name = await rl.question("Display name: ");
    const password = await rl.question(
      `Password (min ${MIN_ADMIN_PASSWORD_LENGTH} characters, visible): `,
    );

    const created = await createAdministrator({ email, name, password });
    console.log(`Created administrator ${created.email} (${created.id}).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

void main();
