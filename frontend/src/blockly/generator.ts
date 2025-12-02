// frontend/src/blockly/generator.ts
import * as Blockly from 'blockly'

export type Stmt =
  | { t: 'move'; steps: number }
  | { t: 'turn'; dir: 'right' | 'left'; deg: number }
  | { t: 'goto'; x: number; y: number }
  | { t: 'repeat'; n: number; body: Stmt[] }
  | { t: 'wait'; sec: number }
  | { t: 'say'; text: string }

export function astFromWorkspace(ws: Blockly.WorkspaceSvg): Stmt[] {
  const top = ws.getTopBlocks(true)
  const out: Stmt[] = []
  for (const b of top) serialize(b, out)
  return out
}

function serialize(b: Blockly.Block, out: Stmt[]) {
  switch (b.type) {
    case 'move_steps':
      out.push({ t: 'move', steps: Number(b.getFieldValue('STEPS')) })
      break
    case 'turn_right':
      out.push({ t: 'turn', dir: 'right', deg: Number(b.getFieldValue('DEG')) })
      break
    case 'turn_left':
      out.push({ t: 'turn', dir: 'left', deg: Number(b.getFieldValue('DEG')) })
      break
    case 'goto_xy':
      out.push({
        t: 'goto',
        x: Number(b.getFieldValue('X')),
        y: Number(b.getFieldValue('Y')),
      })
      break
    case 'repeat_times': {
      const n = Number(b.getFieldValue('N'))
      const body: Stmt[] = []
      let cur = b.getInputTargetBlock('DO')
      while (cur) {
        serialize(cur, body)
        cur = cur.getNextBlock()
      }
      out.push({ t: 'repeat', n, body })
      break
    }
    case 'wait_seconds':
      out.push({ t: 'wait', sec: Number(b.getFieldValue('SEC')) })
      break
    case 'say_text':
      out.push({ t: 'say', text: String(b.getFieldValue('TEXT')) })
      break
  }
  const next = b.getNextBlock()
  if (next) serialize(next, out)
}

export function toEntryProject(ast: Stmt[]) {
  const blocks = ast.map((s, idx) => ({
    id: `b${idx + 1}`,
    type: s.t,
    params: s,
  }))
  return {
    id: `ai_entry_${Date.now()}`,
    name: 'AI 추천 블록 코드',
    scenes: [
      {
        name: '장면 1',
        objects: [
          {
            name: '주인공',
            scripts: blocks,
          },
        ],
      },
    ],
    meta: {
      createdAt: new Date().toISOString(),
      generator: 'AI-Block-Helper',
    },
  }
}
