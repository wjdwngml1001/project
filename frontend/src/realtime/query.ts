export function getParam(key: string, def?: string) {
  const url = new URL(window.location.href)
  return url.searchParams.get(key) ?? def ?? ''
}
