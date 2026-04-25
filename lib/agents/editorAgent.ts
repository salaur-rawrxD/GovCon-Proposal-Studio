import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { editorRevision } from "@/lib/ai/prompts";

export async function runEditorAgent(input: {
  sectionContent: string;
  userMessage: string;
  context: string;
}): Promise<string> {
  return withAiMode({
    mock: () => {
      const t = input.sectionContent.trim();
      const add = `Update (${input.userMessage.slice(0, 80)}): `;
      return t ? `${t}\n\n${add}Strengthened alignment to evaluation factors and added explicit win themes while preserving the original intent.` : add + "Please provide draft text to edit.";
    },
    real: async () => {
      const raw = await completeJsonString({
        system: editorRevision.system,
        user: JSON.stringify({
          userMessage: input.userMessage,
          currentText: input.sectionContent,
          context: input.context,
          task: "Return JSON: { content: string }",
        }),
      });
      return (JSON.parse(raw) as { content: string }).content;
    },
  });
}
