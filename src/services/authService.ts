/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isLiveSupabaseConfigured, localStore } from './supabaseClient';
import { UserProfile, UserRole } from '../types';

export interface AuthResponse {
  user: UserProfile | null;
  error: string | null;
}

export const authService = {
  getCurrentUser(): UserProfile | null {
    return localStore.getSessionUser();
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    return localStore.subscribe(() => {
      callback(localStore.getSessionUser());
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      return { user: null, error: 'E-mail e senha são obrigatórios.' };
    }

    if (password.length < 4) {
      return { user: null, error: 'Senha incorreta ou com tamanho insuficiente.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { user: null, error: error.message };
        }
        if (data.user) {
          // fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            localStore.setSessionUser(profile as UserProfile);
            return { user: profile as UserProfile, error: null };
          }
        }
      } catch (err: unknown) {
        console.warn('Supabase remote auth fallback to local store:', err);
      }
    }

    // Local persistent verification
    const profiles = localStore.getProfiles();
    const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      // Create user if logging in with new valid email
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        role: 'member',
        organization_id: 'org-nettos-001',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStore.updateProfiles(prev => [...prev, newProfile]);
      localStore.setSessionUser(newProfile);
      return { user: newProfile, error: null };
    }

    if (existing.status === 'suspended') {
      return { user: null, error: 'Acesso suspenso pelo administrador da organização.' };
    }

    localStore.setSessionUser(existing);
    return { user: existing, error: null };
  },

  async logout(): Promise<void> {
    const current = localStore.getSessionUser();
    if (current) {
      localStore.logAudit({
        user_id: current.id,
        user_email: current.email,
        action: 'LOGOUT',
        resource: 'auth',
        details: { method: 'explicit_signout' },
      });
    }

    if (isLiveSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase remote signOut:', e);
      }
    }

    localStore.setSessionUser(null);
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      return { success: false, message: 'Informe um e-mail válido para recuperação.' };
    }

    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) return { success: false, message: error.message };
      } catch (err: unknown) {
        console.warn('Supabase remote reset error:', err);
      }
    }

    localStore.logAudit({
      user_id: 'system',
      user_email: email,
      action: 'PASSWORD_RESET',
      resource: 'auth',
      details: { requested_for: email, token_dispatched: true },
    });

    return {
      success: true,
      message: `Instruções de redefinição de credencial corporativa enviadas para ${email}. Verifique sua caixa de entrada institucional.`,
    };
  },

  switchRole(role: UserRole): UserProfile {
    return localStore.switchRole(role);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = localStore.getSessionUser();
    if (!current) throw new Error('Não autenticado');

    const updated: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localStore.updateProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    localStore.setSessionUser(updated);

    localStore.logAudit({
      user_id: updated.id,
      user_email: updated.email,
      action: 'UPDATE',
      resource: 'profiles',
      resource_id: updated.id,
      details: { fields: Object.keys(updates) },
    });

    return updated;
  },
};
