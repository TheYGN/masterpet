import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }

  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error)}`);
  }

  return (
    <iframe
      src="/dashboard-preview/index.html"
      title="MasterPet Dashboard Preview"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
    />
  );
}
