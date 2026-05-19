import { LoginForm } from "./login-form";

export const metadata = {
  title: "כניסה — MasterPet",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm errorParam={error} />;
}
