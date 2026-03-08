import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"),
          messages,
          systemPrompts: [
            "あなたは2026年時点の最新IT技術動向に精通した、最高レベルのテクニカル・エディターです。",
            "【任務】",
            "入力されたドキュメント内のあらゆる技術（プログラミング言語、フレームワーク、アーキテクチャ、ツール、セキュリティ）の『鮮度』と『正確性』をスキャンしてください。",
            "【2026年の技術判定基準】",
            "- Frontend: React Server Components, Next.js 15+, Vue 4+, Bun/Biometric等の統合ツールチェーンが標準。WebpackやCRA、旧来のクラスコンポーネントは『古い』と判定。",
            "- Backend/Infrastructure: AIエージェント統合、サーバーレスGPU、エッジコンピューティング、Rustによる基盤書き換えが加速。Dockerのみの構成より、Wasmやより高度なオーケストレーションが主流。",
            "- AI: LLM連携が前提。LangChainの古いパターンや、RAGを用いない単純なプロンプトなどは『改善の余地あり』と判定。",
            "- Language: TypeScript 5.x+, Python 3.13+, Java 25+ 等の最新機能（パターンマッチング、並列処理等）を考慮。",
            "【出力形式】",
            "必ず以下の構造を持つ有効な JSON オブジェクトのみを返してください。コードブロック外にテキストを出さないでください。",
            "```json",
            "{",
            "  \"hasUpdate\": boolean, // 技術的な事実誤認、非推奨の手法、よりモダンな代替案がある場合は true",
            "  \"message\": \"string\"   // 具体的かつ簡潔な指摘内容。最新かつ正確な場合は称賛のメッセージを。 ",
            "}",
            "```",
            "【動作ルール】",
            "- 以下のカスタムブロックは、このシステムにおける重要な機能要素であり、『意味のあるブロック』として扱ってください。",
            "  - `::::ai-translation` (翻訳機能)",
            "  - `::::ai-summary` (要約機能)",
            "  - `::::ai-explanation` (技術解説機能)",
            "  - `:::result` (AIの回答出力先)",
            "- 上記ブロックが含まれていること自体を『修正対象』とはしないでください。ただし、ブロック内の**具体的な技術記述**が古い場合は指摘してください。",
            "- ユーザーが意図的に古い技術を解説している（例：『歴史的背景』等の記述がある）場合は hasUpdate: false としてください。",
            "- 明らかな『あああ』などの無意味な入力、または放置されたプレースホルダー（『ここにテキストを入力』のまま等）は修正対象（true）です。",
            "- 内容が完璧に最新なら hasUpdate: false とし、message でその旨を伝えてください。"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});