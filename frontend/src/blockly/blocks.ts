// frontend/src/blockly/blocks.ts
import * as Blockly from 'blockly'
import 'blockly/blocks'

// 중복 등록 방지
let __registered = false

export function registerBlocks() {
  if (__registered) return
  __registered = true

  // 이동 n 걸음
  Blockly.Blocks['move_steps'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('이동')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'STEPS')
        .appendField('걸음')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    }
  }

  // 오른쪽 회전 (각도 숫자 입력)
  Blockly.Blocks['turn_right'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('오른쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    }
  }

  // 왼쪽 회전 (각도 숫자 입력)
  Blockly.Blocks['turn_left'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('왼쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    }
  }

  // 좌표 이동
  Blockly.Blocks['goto_xy'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x:')
        .appendField(new Blockly.FieldNumber(0), 'X')
        .appendField('y:')
        .appendField(new Blockly.FieldNumber(0), 'Y')
        .appendField('로 이동')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#4C97FF')
    }
  }

  // 반복
  Blockly.Blocks['repeat_times'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('반복')
        .appendField(new Blockly.FieldNumber(10, 1, 9999, 1), 'N')
        .appendField('번')
      this.appendStatementInput('DO').setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    }
  }

  // 대기
  Blockly.Blocks['wait_seconds'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('기다리기')
        .appendField(new Blockly.FieldNumber(1, 0, 9999, 0.1), 'SEC')
        .appendField('초')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#FFAB19')
    }
  }

  // 말하기
  Blockly.Blocks['say_text'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('말하기')
        .appendField(new Blockly.FieldTextInput('안녕!'), 'TEXT')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour('#9966FF')
    }
  }
}
