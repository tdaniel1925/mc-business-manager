import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  { email: "admin@mca.com", password: "admin123", name: "Admin User" },
  { email: "underwriter@mca.com", password: "admin123", name: "John Underwriter" },
  { email: "sales@mca.com", password: "admin123", name: "Jane Sales" },
];

async function main() {
  console.log("Creating users in Supabase Auth...\n");

  for (const user of users) {
    console.log(`Processing ${user.email}...`);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`  ⚠ User already exists in Supabase Auth`);

        // Get existing user
        const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.find(u => u.email === user.email);

        if (existingUser) {
          // Update Prisma user with supabaseId
          await prisma.user.update({
            where: { email: user.email },
            data: { supabaseId: existingUser.id },
          });
          console.log(`  ✓ Updated Prisma user with Supabase ID`);
        }
      } else {
        console.error(`  ✗ Error: ${authError.message}`);
      }
      continue;
    }

    if (authData.user) {
      console.log(`  ✓ Created in Supabase Auth: ${authData.user.id}`);

      // Update Prisma user with supabaseId
      await prisma.user.update({
        where: { email: user.email },
        data: { supabaseId: authData.user.id },
      });
      console.log(`  ✓ Updated Prisma user with Supabase ID`);
    }
  }

  console.log("\n✅ Done!");
  console.log("\nLogin credentials:");
  console.log("  Admin: admin@mca.com / admin123");
  console.log("  Underwriter: underwriter@mca.com / admin123");
  console.log("  Sales: sales@mca.com / admin123");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
