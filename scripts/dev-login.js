#!/usr/bin/env node
// Usage: node scripts/dev-login.js [email]
// Default email: yaringolan0@gmail.com (super_admin)

const fs = require("fs");
const { execSync } = require("child_process");

const envRaw = fs.readFileSync(".env.local", "utf8");
const env = envRaw.split("\n").reduce((a, l) => {
  const m = l.match(/^([A-Z_]+)=(.+)$/);
  if (m) a[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  return a;
}, {});

const email = process.argv[2] || "yaringolan0@gmail.com";

async function main() {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/generate_link`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "magiclink", email }),
    }
  );

  const data = await res.json();

  if (!data.hashed_token) {
    console.error("Error:", JSON.stringify(data));
    process.exit(1);
  }

  const loginUrl = `http://localhost:3000/auth/callback?token_hash=${data.hashed_token}&type=magiclink`;

  console.log(`\n✅ Login URL for: ${email}`);
  console.log(`\n${loginUrl}\n`);

  // Open browser automatically (Windows)
  try {
    execSync(`start "" "${loginUrl}"`);
    console.log("🌐 Browser opened automatically.");
  } catch {
    console.log("Paste the URL above in your browser.");
  }
}

main();
