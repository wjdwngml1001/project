import { create } from 'zustand'

export type Task = { id: string; text: string }
export type Suggestion = { block: string; params: any[] }
export type StackItem = { label: string }
export type Screen = 'dashboard' | 'code'

type AppState = {
  // 학생 입력/계획/추천
  nl: string
  level: 'A'|'B'
  tasks: Task[]
  suggestions: Suggestion[]

  // 코딩 워크스페이스(목업 스택)
  stack: StackItem[]

  // 화면 위치(학생 측)
  screen: Screen

  // actions
  setNL: (s: string) => void
  setLevel: (lv: 'A'|'B') => void
  setPlan: (tasks: Task[], suggestions: Suggestion[]) => void
  addBlock: (label: string) => void
  resetStack: () => void
  setScreen: (s: Screen) => void
}

export const useApp = create<AppState>((set) => ({
  nl: '깃발 누르면 고양이가 앞으로 3칸 가고 안녕이라고 말해',
  level: 'A',
  tasks: [],
  suggestions: [],
  stack: [],
  screen: 'dashboard',

  setNL: (s) => set({ nl: s }),
  setLevel: (lv) => set({ level: lv }),
  setPlan: (tasks, suggestions) => set({ tasks, suggestions }),
  addBlock: (label) => set((st) => ({ stack: [...st.stack, { label }] })),
  resetStack: () => set({ stack: [] }),
  setScreen: (s) => set({ screen: s }),
}))
