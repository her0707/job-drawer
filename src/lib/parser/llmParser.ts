import type { ParsedInboxItem, ParseInput } from "./types";

export async function parseWithLlm(input: ParseInput): Promise<ParsedInboxItem> {
  void input;
  throw new Error("LLM parser is not implemented in the MVP. Use ruleBasedParser.");
}
