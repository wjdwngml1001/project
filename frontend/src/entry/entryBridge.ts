// frontend/src/entry/entryBridge.ts
declare global {
  interface Window { Entry?: any }
}

let ready = false
let initStarted = false

/**
 * entry.min.js <script src="..."> 의 src를 찾아
 * .../dist/ 를 기준으로 extern 경로를 추론한다.
 * 예) ../entry-js/dist/entry.min.js → ../entry-js/dist/extern/
 */
function detectExternLibDirFromScript(): string | null {
  const scripts = Array.from(document.scripts) as HTMLScriptElement[]
  // 우선순위 1: 파일명에 entry.min.js 포함
  let entryScript = scripts.find(s => /(^|\/)entry\.min\.js(\?|$)/.test(s.src))
  // 우선순위 2: dist/entry.js 혹은 dist/entry.*.js
  if (!entryScript) entryScript = scripts.find(s => /\/dist\/entry(\.|-).+\.js(\?|$)/.test(s.src))
  if (!entryScript) return null

  try {
    const url = new URL(entryScript.src, window.location.href)
    // dist/ 까지 자르고 extern/
    const distIndex = url.pathname.lastIndexOf('/dist/')
    if (distIndex === -1) return null
    const base = url.pathname.slice(0, distIndex + '/dist/'.length) // .../dist/
    // 최종 extern/ (Entry가 내부적으로 extern/lib 를 바라봄)
    return base + 'extern/'
  } catch {
    return null
  }
}

type InitOptions = {
  mountId?: string
  libDir?: string // 수동 지정 시 우선
}

export function initEntry(opts: InitOptions = {}) {
  if (initStarted) return
  initStarted = true

  const Entry = window.Entry
  if (!Entry) {
    console.warn(
      '[entryBridge] EntryJS not found on window. ' +
      'index.html에 <script src="../entry-js/dist/entry.min.js"> 가 포함되어 있는지 확인하세요.'
    )
    return
  }

  const mountId = opts.mountId ?? 'entryMount'
  // 1) 사용자가 넘긴 libDir > 2) 스크립트에서 자동 감지 > 3) 합리적 기본값
  const autoLibDir = detectExternLibDirFromScript()
  const libDir  = opts.libDir ?? autoLibDir ?? '../entry-js/dist/extern/'

  let mount = document.getElementById(mountId)
  if (!mount) {
    mount = document.createElement('div')
    mount.id = mountId
    document.body.appendChild(mount)
  }

  Entry.init(mount, {
    libDir,               // ⭐ extern/ 까지 (엔트리는 내부적으로 extern/lib 참조)
    isWorkspace: true,
    useAnimation: true,
    textCodingEnable: false,
  })

  // 로드 완료 이벤트가 있는 버전이면 사용
  try {
    Entry.addEventListener('loadComplete', () => { ready = true })
  } catch {
    // 폴백: 약간의 지연 후 ready 추정
    setTimeout(() => { ready = !!(Entry && Entry.engine) }, 700)
  }
}

export function isEntryReady() {
  return !!window.Entry && ready
}

export function loadProjectJson(project: any) {
  const Entry = window.Entry
  if (!Entry) throw new Error('EntryJS not loaded')
  if (!isEntryReady()) throw new Error('Entry not ready')
  Entry.loadProject(project)
}

export function exportProject() {
  const Entry = window.Entry
  if (!Entry) throw new Error('EntryJS not loaded')
  return Entry.exportProject()
}
