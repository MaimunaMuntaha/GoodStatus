import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://teffcpkmkgazlflcliht.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZmZjcGtta2dhemxmbGNsaWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTExOTcsImV4cCI6MjA0NzU2NzE5N30.Ge8hMFWojEwWlIf9Nu4UjTPRd3Usvr1r2MhoRCjjmK4";

const db = createClient(supabaseUrl, supabaseKey);

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.

export default db;
//i used A4's supabase db as inspo for this file
