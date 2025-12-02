// frontend/src/blockly/blocks.ts
import * as Blockly from 'blockly'

export function registerBlocks() {
  /* =============== 시작 =============== */

  Blockly.Blocks['when_start_clicked'] = {
    init: function () {
      this.appendDummyInput().appendField('시작하기 버튼을 클릭했을 때')
      this.setNextStatement(true, null)
      this.setColour('#00C853')
    },
  }

  Blockly.Blocks['when_key_pressed'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['스페이스', 'SPACE'],
            ['위쪽 화살표', 'UP'],
            ['아래쪽 화살표', 'DOWN'],
            ['왼쪽 화살표', 'LEFT'],
            ['오른쪽 화살표', 'RIGHT'],
            ['엔터', 'ENTER'],
          ]),
          'KEY'
        )
        .appendField(' 키를 눌렀을 때')
      this.setNextStatement(true, null)
      this.setColour('#00C853')
    },
  }

  Blockly.Blocks['when_sprite_clicked'] = {
    init: function () {
      this.appendDummyInput().appendField('오브젝트를 클릭했을 때')
      this.setNextStatement(true, null)
      this.setColour('#00C853')
    },
  }

  Blockly.Blocks['when_message_received'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('신호')
        .appendField(new Blockly.FieldTextInput('신호1'), 'MSG')
        .appendField('을(를) 받았을 때')
      this.setNextStatement(true, null)
      this.setColour('#00C853')
    },
  }

  Blockly.Blocks['broadcast_message'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('신호')
        .appendField(new Blockly.FieldTextInput('신호1'), 'MSG')
        .appendField(' 보내기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00C853')
    },
  }

  /* =============== 흐름 =============== */

  Blockly.Blocks['wait_seconds'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('기다리기')
        .appendField(new Blockly.FieldNumber(1, 0, 9999, 0.1), 'SEC')
        .appendField('초')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00ACC1')
    },
  }

  Blockly.Blocks['repeat_times'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(10, 1, 9999, 1), 'N')
        .appendField('번 반복하기')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00ACC1')
    },
  }

  Blockly.Blocks['repeat_until'] = {
    init: function () {
      this.appendDummyInput().appendField('다음이 참이 될 때까지 반복하기')
      this.appendValueInput('COND').setCheck('Boolean')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00ACC1')
    },
  }

  Blockly.Blocks['flow_if'] = {
    init: function () {
      this.appendValueInput('IF').setCheck('Boolean').appendField('만약')
      this.appendStatementInput('DO').setCheck(null).appendField('이라면')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00ACC1')
    },
  }

  Blockly.Blocks['flow_if_else'] = {
    init: function () {
      this.appendValueInput('IF').setCheck('Boolean').appendField('만약')
      this.appendStatementInput('DO').setCheck(null).appendField('이라면')
      this.appendStatementInput('ELSE').setCheck(null).appendField('아니면')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#00ACC1')
    },
  }

  /* =============== 움직임 =============== */

  Blockly.Blocks['move_steps'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x 방향으로')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'STEPS')
        .appendField('만큼 이동하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['turn_right'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('오른쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 돌기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['turn_left'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('왼쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 돌기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['goto_xy'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x:')
        .appendField(new Blockly.FieldNumber(0), 'X')
        .appendField(' y:')
        .appendField(new Blockly.FieldNumber(0), 'Y')
        .appendField(' 위치로 이동하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['change_x_by'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x 좌표를')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'DX')
        .appendField('만큼 바꾸기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  Blockly.Blocks['change_y_by'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('y 좌표를')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'DY')
        .appendField('만큼 바꾸기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    },
  }

  /* =============== 생김새 =============== */

  Blockly.Blocks['looks_show'] = {
    init: function () {
      this.appendDummyInput().appendField('모양 보이기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  Blockly.Blocks['looks_hide'] = {
    init: function () {
      this.appendDummyInput().appendField('모양 숨기기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  Blockly.Blocks['looks_change_size'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('크기를')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'SIZE')
        .appendField('% 만큼 바꾸기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  Blockly.Blocks['looks_set_size'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('크기를')
        .appendField(new Blockly.FieldNumber(100, 1, 1000, 1), 'SIZE')
        .appendField('% 로 정하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  // ✅ 말하기도 생김새 색(#FF66CC)으로 통일
  Blockly.Blocks['say_text'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('말하기')
        .appendField(new Blockly.FieldTextInput('안녕!'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FF66CC')
    },
  }

  /* =============== 소리 =============== */

  Blockly.Blocks['sound_play'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('소리')
        .appendField(new Blockly.FieldTextInput('기본 소리'), 'SOUND')
        .appendField(' 재생하기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1E88E5')
    },
  }

  Blockly.Blocks['sound_stop_all'] = {
    init: function () {
      this.appendDummyInput().appendField('모든 소리 멈추기')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#1E88E5')
    },
  }

  /* =============== 판단(Logic) – 한글 표현식 블록 =============== */

  Blockly.Blocks['logic_compare_kor'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number')
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'EQ'],
          ['<', 'LT'],
          ['>', 'GT'],
        ]),
        'OP'
      )
      this.appendValueInput('B').setCheck('Number')
      this.setOutput(true, 'Boolean')
      this.setColour('#2E7D32')
    },
  }

  Blockly.Blocks['logic_operation_kor'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Boolean')
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['그리고', 'AND'],
          ['또는', 'OR'],
        ]),
        'OP'
      )
      this.appendValueInput('B').setCheck('Boolean')
      this.setOutput(true, 'Boolean')
      this.setColour('#2E7D32')
    },
  }

  Blockly.Blocks['logic_not_kor'] = {
    init: function () {
      this.appendDummyInput().appendField('아니다 (not)')
      this.appendValueInput('BOOL').setCheck('Boolean')
      this.setOutput(true, 'Boolean')
      this.setColour('#2E7D32')
    },
  }

  Blockly.Blocks['logic_boolean_kor'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['참', 'TRUE'],
          ['거짓', 'FALSE'],
        ]),
        'BOOL'
      )
      this.setOutput(true, 'Boolean')
      this.setColour('#2E7D32')
    },
  }

  // 계산/자료/리스트/함수는 blockly 한글 메시지를 사용 (bridge.ts 에서 ko 로케일 불러옴)
}
