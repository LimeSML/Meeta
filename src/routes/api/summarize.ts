import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/summarize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json();

        const stream = chat({
          adapter: geminiText("gemini-2.5-flash"),
          messages,
          systemPrompts: [
            "あなたは技術選定やアーキテクチャ設計に携わる経験豊富なテックリードです。",
            "入力されたIT技術に関するドキュメントや説明文を、以下の構成で要約してください。",
            "【構成】",
            "1. 要旨（3行以内）：全体を一言で表すと何か、簡潔に記述してください。",
            "2. 主要なポイント（箇条書き）：技術的な特徴やメリット、解決する課題を3〜5個抽出してください。",
            "3. 考慮事項/制約：使用上の注意点やトレードオフがあれば1〜2個記述してください。",
            "【ルール】",
            "- エンジニアにとって意味のある「技術的キーワード」を逃さず記述してください。",
            "- 結論から先に述べる「プレップ法（PREP法）」を意識してください。",
            "- 挨拶や冗長な前置きは完全に排除し、要約内容のみを返してください。",
            "- マークダウンの箇条書き（- ）を使用して読みやすくしてください。"
          ],
        });

        return toServerSentEventsResponse(stream);
      },
    },
  },
});