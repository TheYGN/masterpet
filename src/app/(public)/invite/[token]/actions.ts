"use server";

import { createClient } from "@/lib/supabase/server";

export type InviteActionState = {
  success?: boolean;
  error?: string;
};

export async function sendInviteMagicLinkAction(
  _prev: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const token = formData.get("token") as string;
  const email = formData.get("email") as string;

  if (!token || !email) return { error: "פרטים חסרים." };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      }/auth/confirm?invitation_token=${token}`,
    },
  });

  if (error) return { error: "אירעה שגיאה בשליחת הקישור. אנא נסו שוב." };

  return { success: true };
}
