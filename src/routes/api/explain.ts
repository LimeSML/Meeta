import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/explain")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"),
          messages,
          systemPrompts: [
            "あなたはシニアソフトウェアエンジニア、かつ技術教育のスペシャリストです。",
            "入力されたIT技術に関する用語や日本語の文章について、以下の構成で解説を提供してください。",
            "【構成】",
            "1. 一言でいうと：その技術や概念を、中学生でもわかるレベルの短い一言で定義してください。",
            "2. 技術的な詳細：エンジニア向けに、背景、仕組み、主要なメリットをプロの視点で解説してください。",
            "3. 具体的なユースケース：どのような場面で使われるか、コード例や具体的なサービス名を挙げて説明してください。",
            "4. 関連用語：一緒に語られることが多い用語や、対照的な概念を数案提示してください。",
            "【ルール】",
            "- 曖昧な表現を避け、技術的に正確な情報を提供してください。",
            "- 難しい概念は、身近なものへの例え（メタファー）を活用してください。",
            "- マークダウンを活用し、重要なキーワードは太字で強調してください。"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});