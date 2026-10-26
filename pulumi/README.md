# Pulumi

Lib-monorepo IaC: GitHub **settings** only. Do **not** construct `Webapp` / `Extapp` / `Mobapp` here.

When a product repo has `apps/<type>`, construct the pack in `apps/<type>/pulumi.ts` and side-effect-import that file from `pulumi/index.ts`.
