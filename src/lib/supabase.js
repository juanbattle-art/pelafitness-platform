import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zdmoxnapheaizbinxvqr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkbW94bmFwaGVhaXpiaW54dnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTczOTUsImV4cCI6MjA5MzMzMzM5NX0.zrDs-hvAjnoNFtvJ1uaKn5KLh72vPAKy1fQL8LUKfa8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
