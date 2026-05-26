import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hrlrxjnyafzcoljguwkl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybHJ4am55YWZ6Y29samd1d2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEyNjYxOCwiZXhwIjoyMDk0NzAyNjE4fQ.ih6sHIGDnlvmerwCb_tNxGnLujfbuRm7I5GAANRwqmQ',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: 'qa-tenant-001@masterpet-test.local',
  options: { redirectTo: 'http://localhost:3000/auth/callback' },
})

if (error) { console.error('ERROR:', error.message); process.exit(1) }

// Our auth flow uses token_hash, not the raw action_link (which points to Supabase /auth/v1/verify)
const tokenHash = data.properties.hashed_token
console.log(`\nOpen this URL in your browser:\n`)
console.log(`http://localhost:3000/auth/confirm?token_hash=${tokenHash}&type=magiclink`)
console.log(`\n(Click the "כניסה" button on the page to confirm)\n`)
