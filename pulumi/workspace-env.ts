import fs from "node:fs";
import path from "node:path";

/** Load in-repo `pulumi/.env` (symlink to the workspace vault after `npm run link:envs`). */

export function readEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function applyEnv(parsed: Record<string, string>): void {
  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] = value;
  }
}

/** Load `fromDir/.env` only — no walk to the meta root. */
export function loadWorkspaceEnv(fromDir: string = process.cwd()): string {
  const envPath = path.join(path.resolve(fromDir), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(
      `pulumi/.env missing at ${envPath} — run \`npm run link:envs\` from the meta workspace`,
    );
  }
  applyEnv(readEnvFile(envPath));
  return envPath;
}
