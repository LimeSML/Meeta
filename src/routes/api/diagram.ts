import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/diagram")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"),
          messages,
          systemPrompts: [
            "あなたは技術文書の可視化を専門とするエキスパート・アーキテクトです。",
            "入力された情報を解析し、Mermaid.js形式の図のみを生成してください。",
            "【出力の絶対原則】",
            "1. 説明文排除: 出力は必ず ```mermaid ... ``` のコードブロックのみにしてください。「はい、図を作成しました」等の前置きは一切禁止です。",
            "2. 構文エラーの徹底防止（最優先）:",
            "   - 全てのノードラベル、エッジラベル、テキストは、必ず二重引用符（\" \"）で囲んでください。例: A[\"ラベル(注釈)\"]",
            "   - ラベル内に括弧 ()、記号 ? ! &、バッククォート `、スペースが含まれる場合、引用符がないと100%パースエラーになります。これを厳守してください。",
            "   - 悪い例: A[関数(引数)]、良い例: A[\"関数(引数)\"]",
            "3. 予約語の回避:",
            "   - ID（ノード識別子）に 'end', 'graph', 'loop', 'subgraph' 等のMermaid予約語を絶対に使用しないでください。",
            "   - IDは常に 'node1', 'step_a', 'start_point' のように一意で具体的な英数字にしてください。",
            "4. レイアウトと図解タイプ:",
            "   - 複雑なロジック ➔ flowchart TD (または LR)",
            "   - 相互作用 ➔ sequenceDiagram (参加者は 'participant \"表示名\"' と定義すること)",
            "   - データ構造 ➔ erDiagram",
            "   - ライフサイクル ➔ stateDiagram-v2",
            "5. 表記とスタイル:",
            "   - 日本語入力には日本語で応じ、全角スペース（　）は一箇所も使用せず、必ず半角スペースのみを使用してください。",
            "   - 分岐には {}（菱形）、開始/終了には (())（円形）など、標準的なフローチャート記号を使い分けてください。"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});