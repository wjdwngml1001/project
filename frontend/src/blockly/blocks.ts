// frontend/src/blockly/blocks.ts
import * as Blockly from 'blockly'

/**
 * 엔트리 스타일 한글 블록 정의
 * - type 이름은 toolbox에서 사용하는 ID와 동일해야 함
 */
export function registerBlocks() {
  // --- 시작 (이벤트) ---
  Blockly.Blocks['event_when_flag_clicked'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('시작하기 버튼을 클릭했을 때')
      this.setNextStatement(true, null)
      this.setColour('#FFD500')
    },
  }

  Blockly.Blocks['event_when_key_pressed'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('키보드')
        .appendField(
          new Blockly.FieldDropdown([
            ['스페이스', 'SPACE'],
            ['위쪽 화살표', 'UP'],
            ['아래쪽 화살표', 'DOWN'],
            ['왼쪽 화살표', 'LEFT'],
            ['오른쪽 화살표', 'RIGHT'],
          ]),
          'KEY',
        )
        .appendField('키를 눌렀을 때')
      this.setNextStatement(true, null)
      this.setColour('#FFD500')
    },
  }

  Blockly.Blocks['event_when_clicked'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('이 스프라이트를 클릭했을 때')
      this.setNextStatement(true, null)
      this.setColour('#FFD500')
    },
  }

  // --- 흐름 (제어) ---
  Blockly.Blocks['control_repeat'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('반복하기')
        .appendField(new Blockly.FieldNumber(10, 1, 9999, 1), 'TIMES')
        .appendField('번')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    },
  }

  Blockly.Blocks['control_forever'] = {
    init: function () {
      this.appendDummyInput().appendField('계속 반복하기')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setColour('#FFAB19')
    },
  }

  Blockly.Blocks['control_wait'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('기다리기')
        .appendField(new Blockly.FieldNumber(1, 0, 9999, 0.1), 'SEC')
        .appendField('초')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    },
  }

  Blockly.Blocks['control_if'] = {
    init: function () {
      this.appendValueInput('COND')
        .setCheck('Boolean')
        .appendField('만약')
      this.appendDummyInput().appendField('라면')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    },
  }

  Blockly.Blocks['control_if_else'] = {
    init: function () {
      this.appendValueInput('COND')
        .setCheck('Boolean')
        .appendField('만약')
      this.appendDummyInput().appendField('라면')
      this.appendStatementInput('DO').setCheck(null)
      this.appendDummyInput().appendField('아니라면')
      this.appendStatementInput('ELSE').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    },
  }

  // --- 움직임 ---
  Blockly.Blocks['motion_movesteps'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('앞으로')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'STEPS')
        .appendField('만큼 움직이기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['motion_turn_right'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('오른쪽으로')
        // 🔧 FieldAngle → FieldNumber 로 변경 (타입 문제 해결)
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['motion_turn_left'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('왼쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['motion_goto_xy'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x:')
        .appendField(new Blockly.FieldNumber(0), 'X')
        .appendField(' y:')
        .appendField(new Blockly.FieldNumber(0), 'Y')
        .appendField('로 이동하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  // --- 생김새 ---
  Blockly.Blocks['looks_say'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('말하기')
        .appendField(new Blockly.FieldTextInput('안녕!'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC') // 핑크
    },
  }

  Blockly.Blocks['looks_think'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('생각하기')
        .appendField(new Blockly.FieldTextInput('음...'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  // --- 소리 ---
  Blockly.Blocks['sound_play'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('소리')
        .appendField(
          new Blockly.FieldDropdown([
            ['(기본 소리)', 'DEFAULT'],
            ['야옹', 'MEOW'],
            ['삐뽀', 'BEEP'],
          ]),
          'SOUND',
        )
        .appendField('재생하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#CF63CF') // 보라 계열
    },
  }

  // --- 판단 (논리) ---
  Blockly.Blocks['logic_compare'] = {
    init: function () {
      this.appendValueInput('A')
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['=', 'EQ'],
            ['>', 'GT'],
            ['<', 'LT'],
          ]),
          'OP',
        )
      this.appendValueInput('B')
      this.setOutput(true, 'Boolean')
      this.setColour('#40BF4A')
    },
  }

  Blockly.Blocks['logic_operation'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Boolean')
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['그리고', 'AND'],
            ['또는', 'OR'],
          ]),
          'OP',
        )
      this.appendValueInput('B').setCheck('Boolean')
      this.setOutput(true, 'Boolean')
      this.setColour('#40BF4A')
    },
  }

  Blockly.Blocks['logic_boolean'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['참', 'TRUE'],
          ['거짓', 'FALSE'],
        ]),
        'BOOL',
      )
      this.setOutput(true, 'Boolean')
      this.setColour('#40BF4A')
    },
  }

  // --- 계산 (수학) ---
  Blockly.Blocks['math_number'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldNumber(0),
        'NUM',
      )
      this.setOutput(true, 'Number')
      this.setColour('#FFBF00')
    },
  }

  Blockly.Blocks['math_arithmetic'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number')
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['+', 'ADD'],
            ['-', 'MINUS'],
            ['×', 'MUL'],
            ['÷', 'DIV'],
          ]),
          'OP',
        )
      this.appendValueInput('B').setCheck('Number')
      this.setOutput(true, 'Number')
      this.setColour('#FFBF00')
    },
  }

  Blockly.Blocks['math_round'] = {
    init: function () {
      this.appendValueInput('N').setCheck('Number').appendField('반올림(')
      this.appendDummyInput().appendField(')')
      this.setOutput(true, 'Number')
      this.setColour('#FFBF00')
    },
  }

  // --- 자료 (변수) ---
  Blockly.Blocks['data_variable'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR')
      this.setOutput(true, null)
      this.setColour('#FF8C1A')
    },
  }

  Blockly.Blocks['data_setvariableto'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR')
        .appendField('을(를)')
      this.appendValueInput('VALUE').setCheck(null)
      this.appendDummyInput().appendField('(으)로 정하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF8C1A')
    },
  }

  Blockly.Blocks['data_changevariableby'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR')
        .appendField('에')
      this.appendValueInput('VALUE').setCheck('Number')
      this.appendDummyInput().appendField('만큼 더하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF8C1A')
    },
  }

  // --- 리스트 ---
  Blockly.Blocks['list_create'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('만들기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF661A')
    },
  }

  Blockly.Blocks['list_add'] = {
    init: function () {
      this.appendValueInput('ITEM')
        .setCheck(null)
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('에')
      this.appendDummyInput().appendField('추가하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF661A')
    },
  }

  Blockly.Blocks['list_get'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('의')
        .appendField(
          new Blockly.FieldNumber(1, 1, 9999, 1),
          'INDEX',
        )
        .appendField('번째 항목')
      this.setOutput(true, null)
      this.setColour('#FF661A')
    },
  }

  // --- 함수 ---
  Blockly.Blocks['func_call'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('함수')
        .appendField(new Blockly.FieldTextInput('함수1'), 'NAME')
        .appendField('실행하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#A65C00')
    },
  }

  Blockly.Blocks['func_def'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('함수 정의')
        .appendField(new Blockly.FieldTextInput('함수1'), 'NAME')
      this.appendStatementInput('BODY').setCheck(null)
      this.setColour('#A65C00')
    },
  }
}
