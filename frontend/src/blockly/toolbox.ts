// frontend/src/blockly/toolbox.ts
export const toolboxXml = `
<xml id="toolbox" style="display: none">
  <!-- 시작 -->
  <category name="시작" colour="#00C853">
    <block type="when_start_clicked"></block>
    <block type="when_key_pressed"></block>
    <block type="when_sprite_clicked"></block>
    <block type="when_message_received"></block>
    <block type="broadcast_message"></block>
  </category>

  <!-- 흐름 -->
  <category name="흐름" colour="#00ACC1">
    <block type="wait_seconds"></block>
    <block type="repeat_times"></block>
    <block type="repeat_until"></block>
    <block type="flow_if"></block>
    <block type="flow_if_else"></block>
  </category>

  <!-- 움직임 -->
  <category name="움직임" colour="#4C97FF">
    <block type="move_steps"></block>
    <block type="turn_right"></block>
    <block type="turn_left"></block>
    <block type="goto_xy"></block>
    <block type="change_x_by"></block>
    <block type="change_y_by"></block>
  </category>

  <!-- 생김새 -->
  <category name="생김새" colour="#FF66CC">
    <block type="looks_show"></block>
    <block type="looks_hide"></block>
    <block type="looks_change_size"></block>
    <block type="looks_set_size"></block>
    <block type="say_text"></block>
  </category>

  <!-- 소리 -->
  <category name="소리" colour="#1E88E5">
    <block type="sound_play"></block>
    <block type="sound_stop_all"></block>
  </category>

  <!-- 판단 (한글 커스텀) -->
  <category name="판단" colour="#2E7D32">
    <block type="logic_compare_kor"></block>
    <block type="logic_operation_kor"></block>
    <block type="logic_not_kor"></block>
    <block type="logic_boolean_kor"></block>
  </category>

  <!-- 계산 (기호 위주라 기본 블록 사용) -->
  <category name="계산" colour="#F9A825">
    <block type="math_number"></block>
    <block type="math_arithmetic"></block>
    <block type="math_round"></block>
    <block type="math_random_int"></block>
  </category>

  <!-- 자료(변수) -->
  <category name="자료" colour="#FF7043" custom="VARIABLE"></category>

  <!-- 리스트: 정적인 블록 (custom 콜백 X) -->
  <category name="리스트" colour="#FF7043">
    <block type="lists_create_with">
      <mutation items="3"></mutation>
    </block>
    <block type="lists_repeat"></block>
    <block type="lists_length"></block>
    <block type="lists_isEmpty"></block>
    <block type="lists_indexOf"></block>
    <block type="lists_getIndex"></block>
    <block type="lists_setIndex"></block>
  </category>

  <!-- 함수 -->
  <category name="함수" colour="#8D6E63" custom="PROCEDURE"></category>
</xml>
`
