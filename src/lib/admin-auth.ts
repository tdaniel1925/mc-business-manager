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

// Check if user is a platform admin
export async function isPlatformAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  return user?.platformRole !== null;
}

// Get admin session with full user details
export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      company: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Check if platform admin
  const isAdmin = user.platformRole !== null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
      companyRole: user.companyRole,
      companyId: user.companyId,
      company: user.company,
      isAdmin,
      supabaseId: session.user.id,
    },
  };
}

// Require platform admin access
export async function requirePlatformAdmin() {
  const session = await getAdminSession();

  if (!session || !session.user.isAdmin) {
    throw new Error("Unauthorized: Platform admin access required");
  }

  return session;
}

// Require specific platform role
export async function requirePlatformRole(roles: string[]) {
  const session = await getAdminSession();

  if (!session || !session.user.platformRole) {
    throw new Error("Unauthorized: Platform access required");
  }

  if (!roles.includes(session.user.platformRole)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }

  return session;
}
