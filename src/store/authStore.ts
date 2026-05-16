import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/supabase/utils/supabase';
import type { UserRole } from '@/types';

interface AuthState {
    user: User | null;
    role: UserRole | null;
    captainId: string | null;
    loading: boolean;
    error: string | null;

    loadSession: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendCaptainInvite: (email: string, captainId: string, auctionId: string) => Promise<void>;
    claimInvite: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    role: null,
    captainId: null,
    loading: true,
    error: null,

    loadSession: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            set({ user: null, role: null, captainId: null, loading: false });
            return;
        }

        const user = session.user;
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, captain_id')
            .eq('id', user.id)
            .single();

        set({
            user,
            role: (profile?.role as UserRole) ?? null,
            captainId: profile?.captain_id ?? null,
            loading: false,
        });
    },

    signIn: async (email, password) => {
        set({ error: null });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ error: error.message });
            return;
        }
        await get().loadSession();
    },

    signUp: async (email, password) => {
        set({ error: null });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            set({ error: error.message });
            return;
        }

        if (data.user) {
            // Manually create admin profile (no DB trigger)
            await supabase.from('profiles').insert({
                id: data.user.id,
                role: 'admin',
            });
        }

        await get().loadSession();
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, role: null, captainId: null });
    },

    sendCaptainInvite: async (email, captainId, auctionId) => {
        set({ error: null });

        // Store the pending invite so /join can claim it
        const { error: inviteErr } = await supabase
            .from('captain_invites')
            .insert({ email, captain_id: captainId, auction_id: auctionId });

        if (inviteErr) {
            set({ error: 'Failed to store invite: ' + inviteErr.message });
            return;
        }

        // Send a magic link / OTP to the captain's email
        const { error: otpErr } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/join`,
            },
        });

        if (otpErr) {
            set({ error: 'Failed to send invite email: ' + otpErr.message });
        }
    },

    claimInvite: async () => {
        set({ error: null });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            set({ error: 'No active session.' });
            return;
        }

        // Find a pending invite for this email
        const { data: invite } = await supabase
            .from('captain_invites')
            .select('id, captain_id')
            .eq('email', user.email ?? '')
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!invite) {
            set({ error: 'No pending invite found for this email.' });
            return;
        }

        // Check if a profile already exists (e.g. re-clicking the link)
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existing) {
            await supabase.from('profiles').insert({
                id: user.id,
                role: 'captain',
                captain_id: invite.captain_id,
            });
        } else {
            // Update in case they had a stale admin profile
            await supabase
                .from('profiles')
                .update({ role: 'captain', captain_id: invite.captain_id })
                .eq('id', user.id);
        }

        // Mark invite as used
        await supabase
            .from('captain_invites')
            .update({ used: true })
            .eq('id', invite.id);

        await get().loadSession();
    },

    clearError: () => set({ error: null }),
}));

// Keep session in sync with Supabase auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
        useAuthStore.setState({ user: null, role: null, captainId: null });
    }
});
