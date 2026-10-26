import * as github from "@pulumi/github";
import { githubProvider } from "./github.Provider.ts";

export const repo = new github.Repository(
  "repo",
  {
    name: "shared",
    visibility: "public",
  },
  {
    provider: githubProvider,
    protect: true,
    import: "shared",
  }
);
