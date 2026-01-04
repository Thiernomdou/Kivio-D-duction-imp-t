"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Singleton pour le client Supabase
const supabase = createClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Charger le profil utilisateur (et le créer si nécessaire)
  const loadProfile = useCallback(async (userId: string, userEmail?: string, userMetadata?: { full_name?: string }) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Si le profil n'existe pas, essayer de le créer
        if (error.code === "PGRST116") {
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                email: userEmail || "",
                full_name: userMetadata?.full_name || null,
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating profile:", insertError);
              // Retourner un profil minimal même si l'insertion échoue
              return null;
            }

            return newProfile as Profile;
          } catch (e) {
            console.error("Exception creating profile:", e);
            return null;
          }
        }

        console.error("Error loading profile:", error);
        return null;
      }

      return data as Profile;
    } catch (e) {
      console.error("Exception loading profile:", e);
      return null;
    }
  }, []);

  // Initialiser la session
  useEffect(() => {
    // Éviter la double initialisation en mode strict de React
    if (initialized.current) return;
    initialized.current = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await loadProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata as { full_name?: string }
          );
          setProfile(profile);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await loadProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata as { full_name?: string }
          );
          setProfile(profile);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Inscription (sans confirmation email - connexion directe)
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Créer le compte
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Connecter immédiatement l'utilisateur après inscription
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Mettre à jour l'état avec la session
      if (signInData.session) {
        setSession(signInData.session);
        setUser(signInData.user);
        if (signInData.user) {
          const profile = await loadProfile(
            signInData.user.id,
            signInData.user.email,
            signInData.user.user_metadata as { full_name?: string }
          );
          setProfile(profile);
        }
      }

      return { error: null, session: signInData.session };
    } catch (error) {
      return { error: error as Error, session: null };
    }
  };

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null, user: data.user };
    } catch (error) {
      return { error: error as Error, user: null };
    }
  };

  // Déconnexion
  const signOut = async () => {
    // NE PAS nettoyer localStorage ici - la simulation sera nettoyée uniquement
    // après avoir été sauvegardée avec succès en base de données
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Mise à jour du profil
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) throw error;

      // Recharger le profil
      const updatedProfile = await loadProfile(user.id);
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
