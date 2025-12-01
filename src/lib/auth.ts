import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import prisma from "./prisma";

// Create a Supabase client for server-side operations
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    }
  );
}

// Get current authenticated user session
export async function auth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // Get user from our database with role info
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!dbUser || !dbUser.isActive) {
    return null;
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      supabaseId: session.user.id,
    },
  };
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign out
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
