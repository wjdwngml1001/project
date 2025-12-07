// frontend/src/blockly/bridge.ts
import * as Blockly from 'blockly'
import 'blockly/blocks'
import { toolbox } from './toolbox'
import { registerBlocks } from './blocks'

let workspace: Blockly.WorkspaceSvg | null = null

export function initBlockly(divId: string): Blockly.WorkspaceSvg {
  // 한 번만 등록
  if (!workspace) {
    registerBlocks()
    workspace = Blockly.inject(divId, {
      toolbox,
      trashcan: true,
      scrollbars: true,
      renderer: 'zelos',
    })
  }
  return workspace
}

export function getWorkspace(): Blockly.WorkspaceSvg | null {
  return workspace
}

export function currentXml(): string {
  if (!workspace) return ''
  const xmlDom = Blockly.Xml.workspaceToDom(workspace)
  return Blockly.Xml.domToPrettyText(xmlDom)
}
