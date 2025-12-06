// frontend/src/blockly/blocks.ts
import * as Blockly from 'blockly';

export type BlockNode = {
  type: string;
  fields?: Record<string, string | number>;
  next?: BlockNode | null;
  inner?: BlockNode | null;
};

export function registerBlocks() {
  /**********************
   * 1. 시작 (이벤트)
   **********************/

  Blockly.Blocks['event_when_flag_clicked'] = {
    init: function () {
      this.appendDummyInput().appendField('시작하기 버튼을 클릭했을 때');
      this.setNextStatement(true, null);
      this.setColour('#FFD500');
      this.setTooltip('시작하기 버튼(깃발)을 클릭했을 때 실행됩니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['event_when_key_pressed'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['스페이스', 'space'],
            ['위쪽 화살표', 'up'],
            ['아래쪽 화살표', 'down'],
            ['왼쪽 화살표', 'left'],
            ['오른쪽 화살표', 'right'],
          ]),
          'KEY',
        )
        .appendField('키를 눌렀을 때');
      this.setNextStatement(true, null);
      this.setColour('#FFD500');
      this.setTooltip('선택한 키를 눌렀을 때 실행됩니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['event_when_clicked'] = {
    init: function () {
      this.appendDummyInput().appendField('이 스프라이트를 클릭했을 때');
      this.setNextStatement(true, null);
      this.setColour('#FFD500');
      this.setTooltip('이 스프라이트를 클릭했을 때 실행됩니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 2. 흐름 (제어)
   **********************/

  Blockly.Blocks['control_wait'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('기다리기')
        .appendField(new Blockly.FieldNumber(1, 0, 9999, 0.1), 'SECONDS')
        .appendField('초');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFAB19');
      this.setTooltip('설정한 시간 동안 기다립니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['control_repeat'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('반복')
        .appendField(new Blockly.FieldNumber(10, 1, 9999, 1), 'TIMES')
        .appendField('번');
      this.appendStatementInput('DO').setCheck(null).appendField('다음 동작을');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFAB19');
      this.setTooltip('설정한 횟수만큼 블록 묶음을 반복합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['control_forever'] = {
    init: function () {
      this.appendDummyInput().appendField('계속 반복하기');
      this.appendStatementInput('DO').setCheck(null).appendField('다음 동작을');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFAB19');
      this.setTooltip('계속해서 반복합니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 3. 움직임
   **********************/

  Blockly.Blocks['motion_movesteps'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('이동')
        .appendField(new Blockly.FieldNumber(10, -1000, 1000, 1), 'STEPS')
        .appendField('걸음');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
      this.setTooltip('앞으로 정해진 만큼 움직입니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['motion_turnright'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('오른쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
      this.setTooltip('오른쪽으로 회전합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['motion_turnleft'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('왼쪽으로')
        .appendField(new Blockly.FieldNumber(15, -360, 360, 1), 'DEG')
        .appendField('도 회전하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
      this.setTooltip('왼쪽으로 회전합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['motion_goto_xy'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('x:')
        .appendField(new Blockly.FieldNumber(0), 'X')
        .appendField(' y:')
        .appendField(new Blockly.FieldNumber(0), 'Y')
        .appendField('로 이동하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
      this.setTooltip('지정한 위치로 이동합니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 4. 생김새
   **********************/

  Blockly.Blocks['looks_say'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('말하기')
        .appendField(new Blockly.FieldTextInput('안녕!'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF6EB4');
      this.setTooltip('말풍선으로 텍스트를 말합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['looks_say_sec'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('말하기')
        .appendField(new Blockly.FieldTextInput('안녕!'), 'TEXT')
        .appendField(new Blockly.FieldNumber(2, 0, 9999, 0.1), 'SECONDS')
        .appendField('초 동안');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF6EB4');
      this.setTooltip('지정한 시간 동안만 말합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['looks_hide'] = {
    init: function () {
      this.appendDummyInput().appendField('숨기기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF6EB4');
      this.setTooltip('스프라이트를 화면에서 숨깁니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['looks_show'] = {
    init: function () {
      this.appendDummyInput().appendField('보이기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF6EB4');
      this.setTooltip('스프라이트를 다시 보이게 합니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 5. 소리
   **********************/

  Blockly.Blocks['sound_play'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('소리')
        .appendField(new Blockly.FieldTextInput('meow'), 'SOUND')
        .appendField('재생하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#CF63CF');
      this.setTooltip('소리를 재생합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['sound_play_until_done'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('소리')
        .appendField(new Blockly.FieldTextInput('meow'), 'SOUND')
        .appendField('끝까지 재생하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#CF63CF');
      this.setTooltip('소리를 끝까지 재생할 때까지 기다립니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['sound_stop_all'] = {
    init: function () {
      this.appendDummyInput().appendField('모든 소리 끄기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#CF63CF');
      this.setTooltip('모든 소리를 멈춥니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 6. 판단 (논리)
   **********************/

  Blockly.Blocks['logic_if'] = {
    init: function () {
      this.appendValueInput('COND')
        .setCheck('Boolean')
        .appendField('만약');
      this.appendStatementInput('DO').appendField('라면');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00A651');
      this.setTooltip('조건이 참일 때만 안의 블록을 실행합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['logic_if_else'] = {
    init: function () {
      this.appendValueInput('COND')
        .setCheck('Boolean')
        .appendField('만약');
      this.appendStatementInput('DO').appendField('라면');
      this.appendStatementInput('ELSE').appendField('아니라면');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#00A651');
      this.setTooltip('조건이 참/거짓일 때 각각 다른 블록을 실행합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['logic_compare'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['=', 'EQ'],
          ['>', 'GT'],
          ['<', 'LT'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Boolean');
      this.setColour('#00A651');
      this.setTooltip('두 값을 비교하는 블록입니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['logic_operation'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Boolean');
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['그리고', 'AND'],
          ['또는', 'OR'],
        ]),
        'OP',
      );
      this.appendValueInput('B').setCheck('Boolean');
      this.setOutput(true, 'Boolean');
      this.setColour('#00A651');
      this.setTooltip('그리고 / 또는 논리 연산을 합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['logic_boolean'] = {
    init: function () {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['참', 'TRUE'],
          ['거짓', 'FALSE'],
        ]),
        'BOOL',
      );
      this.setOutput(true, 'Boolean');
      this.setColour('#00A651');
      this.setTooltip('참/거짓 값을 나타냅니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 7. 계산 (연산)
   **********************/

  Blockly.Blocks['operator_add'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField('+');
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('두 수를 더합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['operator_subtract'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField('-');
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('앞의 수에서 뒤의 수를 뺍니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['operator_multiply'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField('×');
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('두 수를 곱합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['operator_divide'] = {
    init: function () {
      this.appendValueInput('A').setCheck('Number');
      this.appendDummyInput().appendField('÷');
      this.appendValueInput('B').setCheck('Number');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('앞의 수를 뒤의 수로 나눕니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['operator_random'] = {
    init: function () {
      this.appendValueInput('FROM').setCheck('Number').appendField('랜덤');
      this.appendDummyInput().appendField('부터');
      this.appendValueInput('TO').setCheck('Number');
      this.appendDummyInput().appendField('까지');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('두 수 사이의 무작위 정수를 만듭니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['operator_round'] = {
    init: function () {
      this.appendDummyInput().appendField('반올림');
      this.appendValueInput('NUM').setCheck('Number').appendField('');
      this.setOutput(true, 'Number');
      this.setColour('#FFBF00');
      this.setTooltip('수를 가장 가까운 정수로 반올림합니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 8. 자료 (변수)
   **********************/

  Blockly.Blocks['data_variable'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR');
      this.setOutput(true, 'Number');
      this.setColour('#9966FF');
      this.setTooltip('해당 변수의 값을 가져옵니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['data_set_variable'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR')
        .appendField('를');
      this.appendValueInput('VALUE').setCheck('Number').appendField('값으로 정하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
      this.setTooltip('변수의 값을 설정합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['data_change_variable'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('변수')
        .appendField(new Blockly.FieldTextInput('변수1'), 'VAR')
        .appendField('를');
      this.appendValueInput('DELTA').setCheck('Number').appendField('만큼 바꾸기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9966FF');
      this.setTooltip('변수의 값을 일정 값만큼 더하거나 뺍니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 9. 리스트
   **********************/

  Blockly.Blocks['list_add'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('에');
      this.appendValueInput('ITEM').appendField('추가하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8000');
      this.setTooltip('리스트의 맨 끝에 항목을 추가합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['list_remove'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('에서');
      this.appendValueInput('INDEX').setCheck('Number').appendField('번째 항목 삭제하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF8000');
      this.setTooltip('해당 위치의 항목을 삭제합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['list_get'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('리스트')
        .appendField(new Blockly.FieldTextInput('리스트1'), 'LIST')
        .appendField('의');
      this.appendValueInput('INDEX').setCheck('Number').appendField('번째 항목');
      this.setOutput(true, null);
      this.setColour('#FF8000');
      this.setTooltip('리스트에서 해당 위치의 항목을 가져옵니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 10. 함수
   **********************/

  Blockly.Blocks['proc_definition'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('함수')
        .appendField(new Blockly.FieldTextInput('새 함수'), 'NAME')
        .appendField('정의하기');
      this.appendStatementInput('DO').appendField('다음 동작');
      this.setColour('#A0522D');
      this.setTooltip('새로운 함수를 정의합니다.');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['proc_call'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('함수')
        .appendField(new Blockly.FieldTextInput('새 함수'), 'NAME')
        .appendField('실행하기');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#A0522D');
      this.setTooltip('정의한 함수를 실행합니다.');
      this.setHelpUrl('');
    },
  };

  /**********************
   * 11. 호환용 alias
   **********************/
  // 예전에 move_steps 같은 타입을 사용했다면, 에러 안 나게 alias
  Blockly.Blocks['move_steps'] = Blockly.Blocks['motion_movesteps'];
}
