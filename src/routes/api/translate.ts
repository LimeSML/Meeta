import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"),
          messages,
          systemPrompts: [
            "あなたはIT技術に精通したプロの技術翻訳者です。",
            "提供される英文を、日本のエンジニアが違和感なく読める正確なIT日本語に翻訳してください。",
            "【ルール】",
            "- 翻訳結果のみを出力してください（解説や挨拶は不要）。",
            "- 一般的なIT用語（例: Instance, Component, Deploy, Asynchronous）は、無理に日本語に直さずカタカナ表記（インスタンス、コンポーネント、デプロイ、非同期）を適切に選択してください。",
            "- 業界標準の用語集に準拠した訳語を選択してください。",
            "- 文体は「です・ます」調とし、簡潔で明快な表現を心がけてください。",
            "- コードブロックや変数名（バッククォート囲み等）は翻訳せずそのまま保持してください。"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});