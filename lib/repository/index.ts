import { isDemoMode } from "@/lib/config";
import { getServiceSupabase } from "@/lib/supabase/server";
import { createMemoryRepository } from "@/lib/repository/memoryRepository";
import { createSupabaseRepository } from "@/lib/repository/supabaseRepository";
import type { GovRepository } from "@/lib/repository/govRepository";

let cached: GovRepository | null = null;

export function getGovRepository(): GovRepository {
  if (cached) return cached;
  if (isDemoMode() || !getServiceSupabase()) {
    cached = createMemoryRepository();
    return cached;
  }
  cached = createSupabaseRepository();
  return cached;
}

export type { GovRepository } from "@/lib/repository/govRepository";
