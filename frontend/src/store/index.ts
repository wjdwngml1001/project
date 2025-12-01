import { create } from 'zustand'

type Suggest = { block: string; params: any[] }
type StackItem = { label: string }

type S = {
  suggestions: Suggest[]
  setSuggestions: (s: Suggest[]) => void
  stack: StackItem[]
  addBlock: (label: string) => void
  clearStack: () => void
}

export const useApp = create<S>((set) => ({
  suggestions: [],
  setSuggestions: (s) => set({ suggestions: s }),
  stack: [],
  addBlock: (label) => set((st) => ({ stack: [...st.stack, { label }] })),
  clearStack: () => set({ stack: [] })
}))
