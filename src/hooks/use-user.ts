import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import type { User } from '@supabase/supabase-js';

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Create the Supabase client
        const supabase = createClient();

        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return user;
};

export type { User };