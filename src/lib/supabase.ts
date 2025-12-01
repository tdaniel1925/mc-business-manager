import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

// Client-side Supabase client (for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side Supabase client with service role (for API routes)
export function createServerSupabaseClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Storage helpers for document uploads
export const storage = {
  async uploadDocument(
    file: File,
    path: string
  ): Promise<{ url: string; key: string }> {
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(data.path);

    return {
      url: publicUrl,
      key: data.path,
    };
  },

  async deleteDocument(path: string): Promise<void> {
    const { error } = await supabase.storage.from("documents").remove([path]);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },

  async getSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  },
};
