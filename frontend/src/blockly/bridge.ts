// frontend/src/blockly/bridge.ts
import * as Blockly from 'blockly';
import { registerBlocks } from './blocks';

let workspace: Blockly.WorkspaceSvg | null = null;

export function initBlockly(divId: string): Blockly.WorkspaceSvg {
  if (workspace) {
    return workspace;
  }

  // 우리가 정의한 모든 블록 등록
  registerBlocks();

  const toolbox: any = {
    kind: 'categoryToolbox',
    contents: [
      /**********************
       * 시작
       **********************/
      {
        kind: 'category',
        name: '시작',
        colour: '#FFD500',
        contents: [
          { kind: 'block', type: 'event_when_flag_clicked' },
          { kind: 'block', type: 'event_when_key_pressed' },
          { kind: 'block', type: 'event_when_clicked' },
        ],
      },

      /**********************
       * 흐름
       **********************/
      {
        kind: 'category',
        name: '흐름',
        colour: '#FFAB19',
        contents: [
          { kind: 'block', type: 'control_wait' },
          { kind: 'block', type: 'control_repeat' },
          { kind: 'block', type: 'control_forever' },
        ],
      },

      /**********************
       * 움직임
       **********************/
      {
        kind: 'category',
        name: '움직임',
        colour: '#4C97FF',
        contents: [
          { kind: 'block', type: 'motion_movesteps' },
          { kind: 'block', type: 'motion_turnright' },
          { kind: 'block', type: 'motion_turnleft' },
          { kind: 'block', type: 'motion_goto_xy' },
        ],
      },

      /**********************
       * 생김새
       **********************/
      {
        kind: 'category',
        name: '생김새',
        colour: '#FF6EB4',
        contents: [
          { kind: 'block', type: 'looks_say' },
          { kind: 'block', type: 'looks_say_sec' },
          { kind: 'block', type: 'looks_hide' },
          { kind: 'block', type: 'looks_show' },
        ],
      },

      /**********************
       * 소리
       **********************/
      {
        kind: 'category',
        name: '소리',
        colour: '#CF63CF',
        contents: [
          { kind: 'block', type: 'sound_play' },
          { kind: 'block', type: 'sound_play_until_done' },
          { kind: 'block', type: 'sound_stop_all' },
        ],
      },

      /**********************
       * 판단
       **********************/
      {
        kind: 'category',
        name: '판단',
        colour: '#00A651',
        contents: [
          { kind: 'block', type: 'logic_if' },
          { kind: 'block', type: 'logic_if_else' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_boolean' },
        ],
      },

      /**********************
       * 계산
       **********************/
      {
        kind: 'category',
        name: '계산',
        colour: '#FFBF00', // 노란색
        contents: [
          { kind: 'block', type: 'operator_add' },
          { kind: 'block', type: 'operator_subtract' },
          { kind: 'block', type: 'operator_multiply' },
          { kind: 'block', type: 'operator_divide' },
          { kind: 'block', type: 'operator_random' },
          { kind: 'block', type: 'operator_round' },
        ],
      },

      /**********************
       * 자료 (변수)
       **********************/
      {
        kind: 'category',
        name: '자료',
        colour: '#9966FF', // 보라색
        contents: [
          { kind: 'block', type: 'data_variable' },
          { kind: 'block', type: 'data_set_variable' },
          { kind: 'block', type: 'data_change_variable' },
        ],
      },

      /**********************
       * 리스트
       **********************/
      {
        kind: 'category',
        name: '리스트',
        colour: '#FF8000', // 주황
        contents: [
          { kind: 'block', type: 'list_add' },
          { kind: 'block', type: 'list_remove' },
          { kind: 'block', type: 'list_get' },
        ],
      },

      /**********************
       * 함수
       **********************/
      {
        kind: 'category',
        name: '함수',
        colour: '#A0522D', // 갈색
        contents: [
          { kind: 'block', type: 'proc_definition' },
          { kind: 'block', type: 'proc_call' },
        ],
      },
    ],
  };

  workspace = Blockly.inject(divId, {
    toolbox,
    trashcan: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.9,
      maxScale: 1.5,
      minScale: 0.5,
      scaleSpeed: 1.2,
    },
    grid: {
      spacing: 20,
      length: 3,
      colour: '#eee',
      snap: true,
    },
  }) as Blockly.WorkspaceSvg;

  return workspace;
}

export function getWorkspace(): Blockly.WorkspaceSvg | null {
  return workspace;
}

export function currentXml(): string | null {
  if (!workspace) return null;
  const dom = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToText(dom);
}
