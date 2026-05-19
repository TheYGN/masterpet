export default function Home() {
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
