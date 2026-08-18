// Assuming <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is in index.html
const createClient = window.supabase && window.supabase.createClient;

if (!createClient) {
    console.error('Supabase Global not found! Ensure the CDN script is loaded in index.html');
}

const SUPABASE_URL = 'https://qvcbutooceuahvcktfhe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Y2J1dG9vY2V1YWh2Y2t0ZmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODM0MjIsImV4cCI6MjEwMjY1OTQyMn0.JdjDSBJwfqSWmvjq7aDpBIosiZwkQUyM_7BUoQHLWVU';

export const supabase = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
}) : null;

// EXPOSE TO GLOBAL SCOPE FOR NON-MODULE SCRIPTS (like freight_logic.js)
if (supabase) {
    window.supabaseClient = supabase;
}

