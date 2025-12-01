// Supabase Configuration
// Replace these values with your Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

const SUPABASE_CONFIG = {
    url: 'https://wvglzylkmpmbyjsdagmh.supabase.co',
    anonKey: 'sb_publishable_K7nLmK9R562AM3U62SfsIg_Lm6lQy4m'
};

// Initialize Supabase client
// This will be initialized after the Supabase library loads
// Make it globally accessible (use var instead of let for global scope)
var supabase = null;

// Function to get Supabase createClient function
function getSupabaseClient() {
    // Check for ES module version (window.supabaseCreateClient)
    if (typeof window !== 'undefined' && window.supabaseCreateClient) {
        return window.supabaseCreateClient;
    }
    // Check for UMD version (window.supabase.createClient)
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        return window.supabase.createClient.bind(window.supabase);
    }
    // Fallback: check for global createClient
    if (typeof createClient !== 'undefined' && typeof createClient === 'function') {
        return createClient;
    }
    return null;
}

// Function to initialize Supabase client
function initSupabase() {
    // Don't reinitialize if already initialized
    if (supabase !== null) {
        return true;
    }
    
    const createClientFn = getSupabaseClient();
    
    if (createClientFn) {
        // Check if credentials are configured
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' && 
            SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY') {
            try {
                // Use a single storage key to avoid multiple instances warning
                supabase = createClientFn(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                    auth: {
                        storageKey: 'trainTracker-auth',
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                });
                console.log('✅ Supabase client initialized successfully');
                console.log('URL:', SUPABASE_CONFIG.url);
                return true;
            } catch (error) {
                console.error('❌ Error initializing Supabase:', error);
                return false;
            }
        } else {
            console.warn('⚠️ Supabase credentials not configured.');
            console.log('Current config:', SUPABASE_CONFIG);
            return false;
        }
    }
    return false;
}

// Wait for Supabase library to load
function waitForSupabase() {
    // First, try to initialize immediately (in case library is already loaded)
    if (initSupabase()) {
        return; // Success
    }
    
    // If not ready, wait for the 'supabaseReady' event
    if (typeof window !== 'undefined') {
        window.addEventListener('supabaseReady', () => {
            console.log('Supabase library ready event received');
            if (!initSupabase()) {
                console.error('❌ Failed to initialize Supabase even after ready event');
            }
        }, { once: true });
    }
    
    // Also try polling as fallback
    let attempts = 0;
    const maxAttempts = 30;
    
    const tryInit = () => {
        attempts++;
        if (initSupabase()) {
            return; // Success
        }
        if (attempts < maxAttempts) {
            setTimeout(tryInit, 200);
        } else {
            console.error('❌ Failed to initialize Supabase after', maxAttempts, 'attempts');
            console.log('Available globals:', {
                windowSupabaseClient: typeof window !== 'undefined' ? typeof window.supabaseClient : 'undefined',
                windowSupabase: typeof window !== 'undefined' ? typeof window.supabase : 'undefined',
                createClient: typeof createClient
            });
        }
    };
    
    // Start trying after a short delay
    setTimeout(tryInit, 100);
}

// Start initialization when script loads
waitForSupabase();

