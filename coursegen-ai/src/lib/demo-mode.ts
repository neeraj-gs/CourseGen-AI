import { missingRequiredEnv } from "./env";

/**
 * True when every secret the interactive app needs is present.
 *
 * The landing page and its demo recording are fully static, so the site
 * deploys and renders with no configuration at all. Everything that would hit
 * a database or a paid API checks this first and shows a demo notice instead
 * of throwing.
 */
export function isAppConfigured(): boolean {
  return missingRequiredEnv().length === 0;
}
