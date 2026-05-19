"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { postVerifyOrchestration } from "@/lib/auth/post-verify";

const VALID_TYPES: EmailOtpType[] = [
  "magiclink",
  "signup",
  "invite",
  "recovery",
  "email_change",
  "email",
];

export async function confirmAction(formData: FormData): Promise<void> {
  const tokenHash = formData.get("token_hash") as string | null;
  const type = formData.get("type") as string | null;
  const invitationToken = formData.get("invitation_token") as string | null;

  if (!tokenHash || !type || !VALID_TYPES.includes(type as EmailOtpType)) {
    redirect("/login?error=invalid_link");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as EmailOtpType,
  });

  if (error) {
    console.error("[confirmAction] verifyOtp failed:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });
    redirect("/login?error=invalid_link");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?error=auth_failed");

  await postVerifyOrchestration(user, invitationToken);
}
