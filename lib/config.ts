export const isDemoMode = (): boolean => {
  if (process.env.DEMO_MODE === "true") return true;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return true;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  return false;
};

export const isAiMockMode = (): boolean =>
  process.env.AI_MOCK_MODE !== "false";
