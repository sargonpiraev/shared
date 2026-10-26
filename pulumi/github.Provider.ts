import * as github from "@pulumi/github";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWorkspaceEnv } from "./workspace-env.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadWorkspaceEnv(__dirname);

export const githubProvider = new github.Provider("github", {
  token: process.env.GITHUB_TOKEN!,
  owner: "sargonpiraev",
});
