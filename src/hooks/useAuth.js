import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(null); // null = unchecked, true/false = checked

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAllowlist(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAllowlist(session.user.email);
      } else {
        setAllowed(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAllowlist(email) {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email')
      .eq('email', email)
      .single();

    if (data) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }
    setLoading(false);
  }

  const signInWithGoogle = useCallback(() => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAllowed(null);
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    allowed,
    signInWithGoogle,
    signOut,
  };
}
