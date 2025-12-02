// frontend/src/pages/StudentCode.tsx
import { useEffect, useState } from "react";
import * as Blockly from "blockly";
import { initBlockly, getWorkspace, currentXml } from "../blockly/bridge";
import { astFromWorkspace, toEntryProject } from "../blockly/generator";
import { connectSocket, tabId } from "../realtime/socket";

type StoredPlan = {
  name: string;
  goal: string;
  summary: string;
  ast?: any;
  createdAt: number;
};

function applyRecommendedBlocks(ws: Blockly.WorkspaceSvg, ast: any | null) {
  ws.clear();

  let prev: Blockly.Block | null = null;
  let first: Blockly.Block | null = null;

  const chainBlock = (block: Blockly.Block) => {
    (block as any).initSvg?.();
    (block as any).render?.();
    if (!first) first = block;
    if (prev && prev.nextConnection && block.previousConnection) {
      prev.nextConnection.connect(block.previousConnection);
    }
    prev = block;
  };

  // 1) “시작하기 버튼을 클릭했을 때” 비슷한 시작 블록
  const start = ws.newBlock("event_whenflagclicked");
  chainBlock(start);

  // 2) ast 내용에 따라 간단한 추천 블록 예시
  if (ast && Array.isArray(ast.steps)) {
    ast.steps.forEach((s: any) => {
      let b: Blockly.Block | null = null;

      switch (s.type) {
        case "say":
          b = ws.newBlock("looks_say");
          b.getField("TEXT")?.setValue(s.text || "안녕!");
          break;
        case "move":
          b = ws.newBlock("motion_movesteps");
          b.getField("STEPS")?.setValue(String(s.steps || 10));
          break;
        case "wait":
          b = ws.newBlock("control_wait");
          b.getField("DURATION")?.setValue(String(s.seconds || 1));
          break;
        case "repeat":
          b = ws.newBlock("control_repeat");
          b.getField("TIMES")?.setValue(String(s.times || 5));
          break;
        default:
          // 알 수 없는 스텝은 말하기 블록으로 대체
          b = ws.newBlock("looks_say");
          b.getField("TEXT")?.setValue(s.text || "이 블록은 나중에 채워요");
      }

      if (b) chainBlock(b);
    });
  } else {
    // ast가 없으면 간단한 기본 추천 시퀀스
    const say = ws.newBlock("looks_say");
    say.getField("TEXT")?.setValue("안녕! 나는 엔트리 고양이야.");
    chainBlock(say);

    const move = ws.newBlock("motion_movesteps");
    move.getField("STEPS")?.setValue("10");
    chainBlock(move);

    const wait = ws.newBlock("control_wait");
    wait.getField("DURATION")?.setValue("1");
    chainBlock(wait);
  }

  if (first) {
    ws.centerOnBlock(first.id);
  }
}

export default function StudentCode() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1) Blockly 초기화 (DOM이 준비된 다음에)
    setTimeout(() => {
      initBlockly("blocklyDiv");
      const ws = getWorkspace();
      if (ws) {
        const raw = localStorage.getItem("studentPlan");
        let ast: any | null = null;
        if (raw) {
          try {
            const obj: StoredPlan = JSON.parse(raw);
            ast = obj.ast || null;
          } catch (e) {
            console.warn("studentPlan 파싱 실패", e);
          }
        }
        applyRecommendedBlocks(ws as Blockly.WorkspaceSvg, ast);
      }
      setReady(true);
    }, 0);

    // 2) 실시간 교사 대시보드용 소켓 연결
    const studentName =
      localStorage.getItem("studentName") || "이름 없는 학생";
    const sock = connectSocket("student", "3A", studentName + "-" + tabId());

    const ping = setInterval(
      () => sock.emit("student:ping", { id: tabId(), name: studentName }),
      3000
    );

    const shot = setInterval(() => {
      const ws = getWorkspace() as any;
      if (!ws) return;
      const svg = ws.getParentSvg?.();
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const dataUrl = "data:image/svg+xml;base64," + svg64;
      sock.emit("student:thumb", { id: tabId(), name: studentName, img: dataUrl });
    }, 4000);

    sock.on("announcement", (msg: string) =>
      alert("[교사 공지]\n\n" + msg)
    );

    return () => {
      clearInterval(ping);
      clearInterval(shot);
      sock.off("announcement");
    };
  }, []);

  const onSave = () => {
    const ws = getWorkspace();
    if (!ws) return;
    const ast = astFromWorkspace(ws);
    const xml = currentXml();
    const entry = toEntryProject(ast);
    const stored = localStorage.getItem("studentPlan");
    let base: any = {};
    if (stored) {
      try {
        base = JSON.parse(stored);
      } catch {
        base = {};
      }
    }
    localStorage.setItem(
      "studentPlan",
      JSON.stringify({ ...base, ast, xml, entry })
    );
    alert("현재 계획과 블록이 저장되었습니다.");
  };

  const onDownloadEntryJson = () => {
    const ws = getWorkspace();
    if (!ws) return;
    const ast = astFromWorkspace(ws);
    const entryJson = toEntryProject(ast);

    const blob = new Blob([JSON.stringify(entryJson, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `entry_project_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>학생 코딩 (Blockly)</h2>
      <div
        id="blocklyDiv"
        style={{
          width: "100%",
          height: "70vh",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      />
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button disabled={!ready} onClick={onSave}>
          현재 계획 저장
        </button>
        <button disabled={!ready} onClick={onDownloadEntryJson}>
          엔트리 JSON 내보내기
        </button>
      </div>
    </div>
  );
}
