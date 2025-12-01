/** EntryJS lazy loader for /public/entry-js
 *  - entry-js 폴더는 frontend/public/entry-js 에 존재해야 한다.
 *  - 런타임에 /entry-js/... 경로로 로드한다(절대경로).
 */

let loaded = false
let loading: Promise<void> | null = null

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`failed to load: ${src}`))
    document.head.appendChild(s)
  })
}

function injectCss(href: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export async function initEntry(opts?: { mountId?: string }) {
  if (loaded) return
  if (loading) return loading

  const base = '/entry-js'
  const dist = `${base}/dist`
  const extern = `${base}/extern`

  // CSS
  injectCss(`${dist}/entry.css`)
  injectCss(`${dist}/entry.min.css`)

  // 언어
  await injectScript(`${base}/extern/lang/ko.js`).catch(()=>{})

  // 의존성 (최소 세트 — 배포본에 따라 경로 구성 상이 가능)
  const deps = [
    `${extern}/lodash.min.js`,
    `${extern}/preloadjs-0.6.0.min.js`,
    `${extern}/easeljs-0.8.0.min.js`,
    `${extern}/soundjs-0.6.0.min.js`,
    `${extern}/flashaudioplugin-0.6.0.min.js`,
    `${extern}/jquery.min.js`,
    `${extern}/jquery-ui.min.js`,
    `${extern}/velocity.min.js`,
    `${extern}/codemirror/lib/codemirror.js`,
    `${extern}/codemirror/addon/hint/show-hint.js`,
    `${extern}/codemirror/addon/lint/lint.js`,
    `${extern}/codemirror/mode/javascript/javascript.js`,
    `${extern}/fuzzy.js`,
    `${extern}/filbert.js`,
    `${extern}/CanvasInput.js`,
    `${extern}/ndgmr.Collision.js`,
    `${extern}/bignumber.min.js`,
    `${extern}/util/static.js`
  ]

  loading = (async () => {
    for (const d of deps) { try { /* eslint-disable no-await-in-loop */ await injectScript(d) } catch {} }
    // 엔트리 엔진
    await injectScript(`${dist}/entry.min.js`)
    loaded = true

    const mountId = opts?.mountId || 'entryMount'
    const mount = document.getElementById(mountId)
    if (mount && (window as any).Entry) {
      ;(window as any).Entry.init(mount, { libDir: `${dist}`, disableHardware: true })
    }
  })()

  return loading
}

export function isEntryReady() {
  return !!(window as any).Entry
}

export function loadProjectJson(pj: any) {
  if (!(window as any).Entry) throw new Error('Entry not ready')
  ;(window as any).Entry.loadProject(pj)
}

export function exportProject(): any {
  if (!(window as any).Entry) throw new Error('Entry not ready')
  return (window as any).Entry.exportProject()
}
