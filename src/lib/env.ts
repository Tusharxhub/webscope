let validated = false;

export function validateServerEnv(): void {
  if (validated) return;

  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  validated = true;
}
