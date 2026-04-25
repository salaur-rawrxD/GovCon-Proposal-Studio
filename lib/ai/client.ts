import { isAiMockMode } from "@/lib/config";

/**
 * Central switch for real vs mock AI. Agents pass both implementations; mock stays deterministic for demos and CI.
 * Wire real calls (OpenAI, Anthropic, etc.) in the `real` function when AI_MOCK_MODE=false.
 */
export async function withAiMode<T>(options: { mock: () => T | Promise<T>; real: () => Promise<T> }): Promise<T> {
  if (isAiMockMode()) {
    return options.mock();
  }
  return options.real();
}

/**
 * Optional: JSON completion helper for live mode — replace body with your provider.
 */
export async function completeJsonString(_args: { system: string; user: string }): Promise<string> {
  throw new Error(
    "Live AI is not configured. Set AI_MOCK_MODE=true (default) or implement completeJsonString with your provider and keys."
  );
}
