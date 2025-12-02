// frontend/src/blockly/applyPlan.ts
import * as Blockly from 'blockly'
import { Stmt } from './generator'
import { getWorkspace } from './bridge'

export function applyPlanToWorkspace(ast: Stmt[]) {
  const ws = getWorkspace() as Blockly.WorkspaceSvg | null
  if (!ws) return

  // 기존 블록 싹 지우고 새로 그리기
  ws.clear()

  let prev: Blockly.Block | null = null

  function makeBlock(stmt: Stmt): Blockly.Block | null {
    let block: Blockly.Block

    switch (stmt.t) {
      case 'move': {
        block = ws.newBlock('move_steps')
        block.setFieldValue(String(stmt.steps), 'STEPS')
        break
      }
      case 'turn': {
        block = ws.newBlock(stmt.dir === 'right' ? 'turn_right' : 'turn_left')
        block.setFieldValue(String(stmt.deg), 'DEG')
        break
      }
      case 'goto': {
        block = ws.newBlock('goto_xy')
        block.setFieldValue(String(stmt.x), 'X')
        block.setFieldValue(String(stmt.y), 'Y')
        break
      }
      case 'wait': {
        block = ws.newBlock('wait_seconds')
        block.setFieldValue(String(stmt.sec), 'SEC')
        break
      }
      case 'say': {
        block = ws.newBlock('say_text')
        block.setFieldValue(stmt.text, 'TEXT')
        break
      }
      case 'repeat': {
        block = ws.newBlock('repeat_times')
        block.setFieldValue(String(stmt.n), 'N')

        // 반복문의 DO 안에 body 블록들 연결
        let innerPrev: Blockly.Block | null = null
        for (const child of stmt.body) {
          const childBlock = makeBlock(child)
          if (!childBlock) continue

          const childSvg = childBlock as any
          if (typeof childSvg.initSvg === 'function') childSvg.initSvg()
          if (typeof childSvg.render === 'function') childSvg.render()

          if (!innerPrev) {
            // 첫 번째 블록은 DO 입력에 붙이고
            const input = block.getInput('DO')
            input?.connection?.connect(childBlock.previousConnection)
          } else {
            // 이후 블록은 이전 블록의 next에 연결
            innerPrev.nextConnection?.connect(childBlock.previousConnection)
          }
          innerPrev = childBlock
        }
        break
      }
      default:
        return null
    }

    // 여기서 타입을 any로 캐스팅해서 initSvg/render 호출 (TS 타입 오류 회피)
    const svgBlock = block as any
    if (typeof svgBlock.initSvg === 'function') svgBlock.initSvg()
    if (typeof svgBlock.render === 'function') svgBlock.render()

    return block
  }

  for (const stmt of ast) {
    const block = makeBlock(stmt)
    if (!block) continue

    if (prev) {
      prev.nextConnection?.connect(block.previousConnection)
    }
    prev = block
  }

  // 워크스페이스 내용에 맞춰 뷰 리사이즈
  ;(ws as any).resizeContents?.()
}
