export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertServerEnv } = await import("./lib/env");
    assertServerEnv();
  }
}

export async function onRequestError(error: unknown) {
  const { logServerError } = await import("./lib/security");
  logServerError(error, "request");
}
