// frontend/src/blockly/bridge.ts
import * as Blockly from "blockly";
import "blockly/blocks";
import "blockly/javascript";

// KO 로케일 불러오기 (named export KO 가 아니라 전체를 import 하는 방식)
import * as ko from "blockly/msg/ko";

// 타입 정의에 setLocale 이 없어서 any 로 한 번 우회
(Blockly as any).setLocale(ko as any);

let workspace: Blockly.WorkspaceSvg | null = null;

// 타입 문제가 있으면 그냥 any 로 두는 편이 실전에서는 편함
const toolbox: any = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "시작",
      colour: "#00C853",
      contents: [
        { kind: "block", type: "event_whenflagclicked" },
        { kind: "block", type: "event_whenkeypressed" },
        { kind: "block", type: "event_whenclicked" },
      ],
    },
    {
      kind: "category",
      name: "흐름",
      colour: "#00ACC1",
      contents: [
        { kind: "block", type: "control_wait" },
        { kind: "block", type: "control_repeat" },
        { kind: "block", type: "control_forever" },
        { kind: "block", type: "control_if" },
        { kind: "block", type: "control_if_else" },
        { kind: "block", type: "control_stop" },
      ],
    },
    {
      kind: "category",
      name: "움직임",
      colour: "#4C97FF",
      contents: [
        { kind: "block", type: "motion_movesteps" },
        { kind: "block", type: "motion_turnright" },
        { kind: "block", type: "motion_turnleft" },
        { kind: "block", type: "motion_goto" },
        { kind: "block", type: "motion_glidesecstoxy" },
      ],
    },
    {
      kind: "category",
      name: "생김새",
      colour: "#FF4081",
      contents: [
        { kind: "block", type: "looks_say" },
        { kind: "block", type: "looks_sayforsecs" },
        { kind: "block", type: "looks_switchcostume" },
        { kind: "block", type: "looks_changesize" },
      ],
    },
    {
      kind: "category",
      name: "소리",
      colour: "#43A047",
      contents: [
        { kind: "block", type: "sound_play" },
        { kind: "block", type: "sound_playuntildone" },
        { kind: "block", type: "sound_setvolumeto" },
      ],
    },
    {
      kind: "category",
      name: "판단",
      colour: "#1E88E5",
      contents: [
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
      ],
    },
    {
      kind: "category",
      name: "계산",
      colour: "#FFD600",
      contents: [
        { kind: "block", type: "math_number" },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_round" },
        { kind: "block", type: "math_random_int" },
      ],
    },
    {
      kind: "category",
      name: "자료",
      colour: "#9C27B0",
      custom: "VARIABLE",
    },
    {
      kind: "category",
      name: "리스트",
      colour: "#FF7043",
      contents: [
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_length" },
        { kind: "block", type: "lists_isEmpty" },
        { kind: "block", type: "lists_getIndex" },
        { kind: "block", type: "lists_setIndex" },
      ],
    },
    {
      kind: "category",
      name: "함수",
      colour: "#8D6E63",
      custom: "PROCEDURE",
    },
  ],
};

export function initBlockly(divId: string) {
  if (workspace) return;

  const div = document.getElementById(divId);
  if (!div) {
    console.warn("blocklyDiv를 찾을 수 없습니다.");
    return;
  }

  workspace = Blockly.inject(div, {
    toolbox,
    renderer: "thrasos",
    collapse: true,
    trashcan: true,
    scrollbars: true,
    zoom: {
      controls: true,
      wheel: true,
    },
  });
}

export function getWorkspace() {
  return workspace;
}

export function currentXml() {
  if (!workspace) return "";
  const dom = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToPrettyText(dom);
}
