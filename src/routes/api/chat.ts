import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini"; // ドキュメント通りのパッケージ名
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        // 1. 環境変数が設定されていれば、引数なしの geminiText() で自動的に読み込まれます
        // 設定されていない場合は createGeminiChat(apiKey) を使用します
        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"), // または "gemini-2.0-flash" など
          messages,
          // 翻訳・要約・解説のための指示を追加
          systemPrompts: [
            "あなたは翻訳、要約、専門用語の解説を行う優秀なアシスタントです。",
            "入力されたテキストに対して、以下の構成で回答してください：",
            "1. 日本語訳",
            "2. 3行以内の要約",
            "3. 重要な用語の解説"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});