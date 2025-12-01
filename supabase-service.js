// Supabase Service Layer
// Handles all database operations with offline fallback

class SupabaseService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.syncInProgress = false;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingChanges();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Check if Supabase is available (just check if configured, not if user is logged in)
    async isAvailable() {
        // Check if supabase client is initialized
        if (typeof supabase === 'undefined' || supabase === null) {
            return false;
        }
        // Check if it has the auth method
        if (!supabase.auth) {
            return false;
        }
        // Supabase is configured and ready to use
        return true;
    }

    // Get current authenticated user
    async getCurrentUser() {
        if (!supabase || !supabase.auth) return null;
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) return null;
            return user;
        } catch (e) {
            return null;
        }
    }

    // Authentication methods
    async signUp(email, password, metadata = {}) {
        const available = await this.isAvailable();
        if (!available || !supabase || !supabase.auth) {
            throw new Error('Supabase not configured');
        }
        try {
            // Validate and normalize email
            const normalizedEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                throw new Error('Email format is invalid');
            }
            
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: {
                        firstName: metadata.firstName || '',
                        lastName: metadata.lastName || ''
                    }
                }
            });
            if (error) {
                // Provide more user-friendly error messages
                if (error.message.includes('already registered')) {
                    throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
                }
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        if (!supabase || !supabase.auth) {
            throw new Error('Supabase not configured');
        }
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    async signOut() {
        if (!this.isAvailable()) return;
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    async getSession() {
        const available = await this.isAvailable();
        if (!available || !supabase || !supabase.auth) return null;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Get session error:', error);
                return null;
            }
            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    // Data operations
    async saveUserData(data) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            // Fallback to localStorage
            return this.saveToLocalStorage(data);
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('save', data);
            return this.saveToLocalStorage(data);
        }

        try {
            const { data: result, error } = await supabase
                .from('user_data')
                .upsert({
                    user_id: userId,
                    data: data,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })
                .select();

            if (error) {
                console.error('Supabase upsert error:', error);
                throw error;
            }

            // Also save to localStorage as backup
            this.saveToLocalStorage(data);
            return true;
        } catch (error) {
            console.error('Save error:', error);
            // Fallback to localStorage
            this.queueForSync('save', data);
            return this.saveToLocalStorage(data);
        }
    }

    async loadUserData() {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            // Fallback to localStorage
            return this.loadFromLocalStorage();
        }

        if (!this.isOnline) {
            // Load from localStorage when offline
            return this.loadFromLocalStorage();
        }

        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('data')
                .eq('user_id', userId)
                .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

            if (error) {
                // Only throw if it's not a "not found" error
                if (error.code !== 'PGRST116' && error.code !== '42P01') {
                    throw error;
                }
                // If table doesn't exist or no data, return null
                return this.loadFromLocalStorage();
            }

            if (data && data.data) {
                // Merge with localStorage to ensure we have latest changes
                const localData = this.loadFromLocalStorage();
                const merged = this.mergeData(localData, data.data);
                this.saveToLocalStorage(merged);
                return merged;
            }

            // No data in Supabase, try localStorage
            return this.loadFromLocalStorage();
        } catch (error) {
            console.error('Load error:', error);
            // Fallback to localStorage
            return this.loadFromLocalStorage();
        }
    }

    // LocalStorage fallback methods
    saveToLocalStorage(data) {
        try {
            const STORAGE_KEY = 'trainingDiary.data';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('LocalStorage save error:', error);
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const STORAGE_KEY = 'trainingDiary.data';
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.error('LocalStorage load error:', error);
            return null;
        }
    }

    // Merge data from two sources (prioritize local changes)
    mergeData(localData, remoteData) {
        if (!localData) return remoteData;
        if (!remoteData) return localData;

        // Simple merge strategy: use local data if it exists, otherwise use remote
        // For more complex scenarios, you might want to compare timestamps
        const merged = { ...remoteData };
        
        // Merge arrays (sessions, routines, etc.)
        if (localData.sessions && Array.isArray(localData.sessions)) {
            merged.sessions = localData.sessions;
        }
        if (localData.routines && Array.isArray(localData.routines)) {
            merged.routines = localData.routines;
        }
        if (localData.goals && Array.isArray(localData.goals)) {
            merged.goals = localData.goals;
        }
        if (localData.achievements && Array.isArray(localData.achievements)) {
            merged.achievements = localData.achievements;
        }
        if (localData.recentAchievements && Array.isArray(localData.recentAchievements)) {
            merged.recentAchievements = localData.recentAchievements;
        }

        // Merge objects
        if (localData.profile) merged.profile = { ...remoteData.profile, ...localData.profile };
        if (localData.prs) merged.prs = { ...remoteData.prs, ...localData.prs };
        if (localData.onerm) merged.onerm = { ...remoteData.onerm, ...localData.onerm };
        if (localData.exerciseNotes) merged.exerciseNotes = { ...remoteData.exerciseNotes, ...localData.exerciseNotes };
        if (localData.streak) merged.streak = localData.streak;
        if (localData.weeklyGoal) merged.weeklyGoal = localData.weeklyGoal;
        if (localData.statsPeriod) merged.statsPeriod = localData.statsPeriod;
        if (localData.notes) merged.notes = localData.notes;

        return merged;
    }

    // Queue operations for sync when online
    queueForSync(operation, data) {
        this.syncQueue.push({ operation, data, timestamp: Date.now() });
        // Limit queue size
        if (this.syncQueue.length > 100) {
            this.syncQueue.shift();
        }
    }

    // Sync pending changes when coming back online
    async syncPendingChanges() {
        if (this.syncInProgress || !this.isOnline || !this.isAvailable()) return;
        
        this.syncInProgress = true;
        try {
            while (this.syncQueue.length > 0) {
                const item = this.syncQueue.shift();
                if (item.operation === 'save') {
                    await this.saveUserData(item.data);
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // Real-time subscription for data changes
    async subscribeToChanges(callback) {
        if (!supabase || !supabase.auth) return null;

        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) return null;

        return supabase
            .channel('user_data_changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_data',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                if (callback) callback(payload.new.data);
            })
            .subscribe();
    }
}

// Create singleton instance
const supabaseService = new SupabaseService();

