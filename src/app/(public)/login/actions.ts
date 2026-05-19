"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  success?: boolean;
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "נדרשת כתובת מייל תקינה" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    console.error("[loginAction] signInWithOtp failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
      name: error.name,
    });
    return { error: "אירעה שגיאה בשליחת הקישור. אנא נסו שוב." };
  }

  return { success: true };
}
