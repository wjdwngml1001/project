export function getParam(key: string, fallback?: string) {
  const url = new URL(window.location.href)
  return url.searchParams.get(key) || fallback
}
