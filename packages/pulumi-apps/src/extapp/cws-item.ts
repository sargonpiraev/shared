/** Chrome Web Store Developer Dashboard — create / manage items (not env). */
export const CWS_DEV_CONSOLE_URL = 'https://chrome.google.com/webstore/devconsole'

export function cwsPublicListingUrl(cwsItemSlug: string, cwsItemId: string): string {
  return `https://chromewebstore.google.com/detail/${cwsItemSlug}/${cwsItemId}`
}

/**
 * CWS item id lives in stack code. The Chrome Web Store API cannot create
 * items — create the listing in the dashboard, then pass the id here.
 */
export function requireCwsItemId(cwsItemId: string): string {
  const id = cwsItemId.trim()
  if (id === '') {
    throw new Error(
      `CWS item id is required in stack code (not env). Create the item in Chrome Web Store Developer Dashboard (${CWS_DEV_CONSOLE_URL}), then set Extapp cwsItemId.`
    )
  }
  return id
}

export function requireCwsItemSlug(cwsItemSlug: string): string {
  const slug = cwsItemSlug.trim()
  if (slug === '') {
    throw new Error(
      `CWS item slug is required in stack code (not env). Create the item in Chrome Web Store Developer Dashboard (${CWS_DEV_CONSOLE_URL}), then set Extapp cwsItemSlug.`
    )
  }
  return slug
}
