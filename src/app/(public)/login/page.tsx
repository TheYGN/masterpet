import { redirect } from "next/navigation";
import { verifySession } from "@/app/lib/dal";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "כניסה — MasterPet",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await verifySession();
  if (session) {
    redirect(session.profile.role === "super_admin" ? "/super-admin/tenants" : "/dashboard");
  }

  const { error } = await searchParams;
  return <LoginForm errorParam={error} />;
}
