import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

function getSupabaseEnv() {
  const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const url = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
  return { url, key };
}

export function hasSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

/**
 * Returns a Supabase client when env vars are set.
 * Until you connect Supabase, this returns null and the app uses local mock data.
 */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;

  if (!client) {
    const { url, key } = getSupabaseEnv();
    client = createClient(url, key, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    if (Platform.OS !== "web") {
      AppState.addEventListener("change", (state) => {
        if (state === "active") {
          client?.auth.startAutoRefresh();
        } else {
          client?.auth.stopAutoRefresh();
        }
      });
    }
  }

  return client;
}
