import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWorkspaceEnv } from "./workspace-env.ts";
import "./github.Repository.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.PATH = `${path.join(__dirname, "node_modules", ".bin")}:${process.env.PATH ?? ""}`;
loadWorkspaceEnv(__dirname);
