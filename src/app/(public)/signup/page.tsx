import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/dal";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "הצטרפות ל-MasterPet",
};

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const session = await verifySession();
  if (session) {
    redirect(session.profile.role === "super_admin" ? "/super-admin/tenants" : "/dashboard");
  }

  return <SignupForm />;
}
