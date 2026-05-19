"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

function generateSlug(name: string): string {
  const ascii = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Date.now().toString(36);
  return ascii.length >= 2 ? `${ascii}-${suffix}` : `tenant-${suffix}`;
}

export type SignupState = {
  errors?: {
    businessName?: string;
    ownerName?: string;
    email?: string;
    phone?: string;
  };
  message?: string;
};

async function verifyTurnstile(token: string | null): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const businessName = formData.get("businessName") as string;
  const businessType = formData.get("businessType") as string;
  const ownerName = formData.get("ownerName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const turnstileToken = formData.get("turnstileToken") as string | null;

  const errors: SignupState["errors"] = {};

  if (!businessName?.trim()) errors.businessName = "שם העסק הוא שדה חובה";
  if (!ownerName?.trim()) errors.ownerName = "שם בעל העסק הוא שדה חובה";
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "נדרש כתובת מייל תקינה";
  if (!phone?.trim()) errors.phone = "מספר טלפון הוא שדה חובה";

  if (Object.keys(errors).length > 0) return { errors };

  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return { message: "אימות האנושיות נכשל. רעננו את הדף ונסו שוב." };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const slug = generateSlug(businessName);

  const { error } = await supabase.from("tenants").insert({
    name: businessName.trim(),
    slug,
    business_type: businessType || null,
    owner_name: ownerName.trim(),
    contact_email: email.trim().toLowerCase(),
    contact_phone: phone.trim(),
    status: "pending_approval",
  });

  if (error) {
    return { message: "אירעה שגיאה. אנא נסו שוב." };
  }

  redirect("/signup/success");
}
