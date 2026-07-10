export interface SeoditNextRouting {
  locales: readonly string[];
  defaultLocale: string;
}

export type SeoditRouteParams = Record<string, string>;

export interface CreateSeoditPageRoutesOptions {
  /** Absolute origin for canonical / alternate URLs (e.g. `https://example.com`). */
  origin?: string;
  params?: SeoditRouteParams[];
  appDir?: string;
  buildDir?: string;
}

export interface SeoditPageRouteAlternate {
  locale: string;
  url: string;
}

export interface SeoditPageRoute {
  locale: string;
  pathname: string;
  params: SeoditRouteParams;
  pattern: string;
  /** Absolute URL. Uses `origin` from options when `baseURL` is omitted. */
  absoluteUrl(baseURL?: string, pathname?: string): string;
  alternates(baseURL?: string): SeoditPageRouteAlternate[];
  xDefaultUrl(baseURL?: string): string;
}

export interface ReadNextPageRoutesOptions {
  buildDir?: string;
}

export interface InferRouteFromSpecOptions {
  appDir?: string;
  buildDir?: string;
}

export interface CheckSeoditSpecCoverageOptions {
  appDir?: string;
  buildDir?: string;
  projectRoot?: string;
}

export interface SeoditSpecCoverageResult {
  warnings: string[];
  manifestRoutes: string[];
  specRoutes: string[];
  missingSpecs: string[];
  orphanSpecs: string[];
}
