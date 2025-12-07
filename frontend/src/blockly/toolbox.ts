// frontend/src/blockly/toolbox.ts
import type * as Blockly from 'blockly'

export const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
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
    {
      kind: 'category',
      name: '흐름',
      colour: '#FFAB19',
      contents: [
        { kind: 'block', type: 'control_repeat' },
        { kind: 'block', type: 'control_forever' },
        { kind: 'block', type: 'control_wait' },
        { kind: 'block', type: 'control_if' },
        { kind: 'block', type: 'control_if_else' },
      ],
    },
    {
      kind: 'category',
      name: '움직임',
      colour: '#4C97FF',
      contents: [
        { kind: 'block', type: 'motion_movesteps' },
        { kind: 'block', type: 'motion_turn_right' },
        { kind: 'block', type: 'motion_turn_left' },
        { kind: 'block', type: 'motion_goto_xy' },
      ],
    },
    {
      kind: 'category',
      name: '생김새',
      colour: '#FF66CC',
      contents: [
        { kind: 'block', type: 'looks_say' },
        { kind: 'block', type: 'looks_think' },
      ],
    },
    {
      kind: 'category',
      name: '소리',
      colour: '#CF63CF',
      contents: [{ kind: 'block', type: 'sound_play' }],
    },
    // --- 판단(논리) ---
    {
      kind: 'category',
      name: '판단',
      colour: '#40BF4A',
      contents: [
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
      ],
    },
    // --- 계산(수학) ---
    {
      kind: 'category',
      name: '계산',
      colour: '#FFBF00',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_round' },
      ],
    },
    // --- 자료(변수) ---
    {
      kind: 'category',
      name: '자료',
      colour: '#FF8C1A',
      contents: [
        { kind: 'block', type: 'data_variable' },
        { kind: 'block', type: 'data_setvariableto' },
        { kind: 'block', type: 'data_changevariableby' },
      ],
    },
    // --- 리스트 ---
    {
      kind: 'category',
      name: '리스트',
      colour: '#FF661A',
      contents: [
        { kind: 'block', type: 'list_create' },
        { kind: 'block', type: 'list_add' },
        { kind: 'block', type: 'list_get' },
      ],
    },
    // --- 함수 ---
    {
      kind: 'category',
      name: '함수',
      colour: '#A65C00',
      contents: [
        { kind: 'block', type: 'func_def' },
        { kind: 'block', type: 'func_call' },
      ],
    },
  ],
}
