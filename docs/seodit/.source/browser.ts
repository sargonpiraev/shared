// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"agent-skill.mdx": () => import("../content/docs/agent-skill.mdx?collection=docs"), "api.mdx": () => import("../content/docs/api.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "next.mdx": () => import("../content/docs/next.mdx?collection=docs"), "playwright.mdx": () => import("../content/docs/playwright.mdx?collection=docs"), }),
};
export default browserCollections;