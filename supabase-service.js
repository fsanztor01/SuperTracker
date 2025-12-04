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

    async resetPassword(email) {
        const available = await this.isAvailable();
        if (!available || !supabase || !supabase.auth) {
            throw new Error('Supabase not configured');
        }
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Reset password error:', error);
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
    // Save data ONLY to Supabase - no localStorage fallback
    async saveUserData(data) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para guardar datos.');
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('save', data);
            throw new Error('Sin conexión a internet. Los datos se guardarán cuando vuelvas a estar en línea.');
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

            // Data saved successfully to Supabase only
            return true;
        } catch (error) {
            console.error('Save error:', error);
            // Queue for sync when online
            this.queueForSync('save', data);
            throw error;
        }
    }

    // Load data ONLY from Supabase - no localStorage fallback
    async loadUserData() {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para cargar datos.');
        }

        if (!this.isOnline) {
            throw new Error('Sin conexión a internet. No se pueden cargar los datos.');
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
                // If table doesn't exist or no data, return null (new user)
                return null;
            }

            if (data && data.data) {
                // Return data from Supabase only
                return data.data;
            }

            // No data in Supabase (new user)
            return null;
        } catch (error) {
            console.error('Load error:', error);
            throw error;
        }
    }

    // Note: LocalStorage methods removed - all app data is stored in Supabase only
    // localStorage is only used for UI preferences (theme, colors) which are not app data

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

    // Session operations - Save individual session to sessions table
    async saveSession(session) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para guardar sesiones.');
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('saveSession', session);
            throw new Error('Sin conexión a internet. La sesión se guardará cuando vuelvas a estar en línea.');
        }

        try {
            // Extract date from session (format: YYYY-MM-DD)
            const sessionDate = session.date ? session.date.split('T')[0] : new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('sessions')
                .upsert({
                    id: session.id,
                    user_id: userId,
                    session_data: session,
                    date: sessionDate,
                    completed: session.completed || false,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select();

            if (error) {
                console.error('Supabase session save error:', error);
                throw error;
            }

            return data?.[0] || null;
        } catch (error) {
            console.error('Save session error:', error);
            // Queue for sync when online
            this.queueForSync('saveSession', session);
            throw error;
        }
    }

    // Delete session from sessions table
    async deleteSession(sessionId) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para eliminar sesiones.');
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('deleteSession', { sessionId });
            throw new Error('Sin conexión a internet. La sesión se eliminará cuando vuelvas a estar en línea.');
        }

        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId)
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase session delete error:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Delete session error:', error);
            // Queue for sync when online
            this.queueForSync('deleteSession', { sessionId });
            throw error;
        }
    }

    // Routine operations - Save individual routine to routines table
    async saveRoutine(routine) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para guardar rutinas.');
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('saveRoutine', routine);
            throw new Error('Sin conexión a internet. La rutina se guardará cuando vuelvas a estar en línea.');
        }

        try {
            const { data, error } = await supabase
                .from('routines')
                .upsert({
                    id: routine.id,
                    user_id: userId,
                    routine_data: routine,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })
                .select();

            if (error) {
                console.error('Supabase routine save error:', error);
                throw error;
            }

            return data?.[0] || null;
        } catch (error) {
            console.error('Save routine error:', error);
            // Queue for sync when online
            this.queueForSync('saveRoutine', routine);
            throw error;
        }
    }

    // Delete routine from routines table
    async deleteRoutine(routineId) {
        const user = await this.getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            throw new Error('Usuario no autenticado. Debes iniciar sesión para eliminar rutinas.');
        }

        if (!this.isOnline) {
            // Queue for sync when online
            this.queueForSync('deleteRoutine', { routineId });
            throw new Error('Sin conexión a internet. La rutina se eliminará cuando vuelvas a estar en línea.');
        }

        try {
            const { error } = await supabase
                .from('routines')
                .delete()
                .eq('id', routineId)
                .eq('user_id', userId);

            if (error) {
                console.error('Supabase routine delete error:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Delete routine error:', error);
            // Queue for sync when online
            this.queueForSync('deleteRoutine', { routineId });
            throw error;
        }
    }

    // Update sync queue handler to handle session and routine operations
    async syncPendingChanges() {
        if (this.syncInProgress || !this.isOnline || !this.isAvailable()) return;
        
        this.syncInProgress = true;
        try {
            while (this.syncQueue.length > 0) {
                const item = this.syncQueue.shift();
                if (item.operation === 'save') {
                    await this.saveUserData(item.data);
                } else if (item.operation === 'saveSession') {
                    await this.saveSession(item.data);
                } else if (item.operation === 'deleteSession') {
                    await this.deleteSession(item.data.sessionId);
                } else if (item.operation === 'saveRoutine') {
                    await this.saveRoutine(item.data);
                } else if (item.operation === 'deleteRoutine') {
                    await this.deleteRoutine(item.data.routineId);
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
}

// Create singleton instance
const supabaseService = new SupabaseService();

