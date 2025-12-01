import * as Blockly from 'blockly'
import { toolboxXml } from './toolbox'
import { registerBlocks } from './blocks'

let workspace: Blockly.WorkspaceSvg | null = null

export function initBlockly(divId = 'blocklyDiv') {
  // 1) 커스텀 블록을 반드시 먼저 등록
  registerBlocks()

  // 2) 그 다음 inject
  const div = document.getElementById(divId)!
  workspace = Blockly.inject(div, {
    toolbox: toolboxXml,
    renderer: 'thrasos',
    zoom: { controls: true, wheel: true },
    trashcan: true
  })

  return workspace
}

export function getWorkspace() { return workspace }

export function currentXml() {
  if (!workspace) return ''
  const xml = Blockly.Xml.workspaceToDom(workspace)
  return Blockly.Xml.domToText(xml)
}
