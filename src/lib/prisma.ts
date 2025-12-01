import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

// Configure connection pool with longer timeouts for Supabase
const pool = new Pool({
  connectionString,
  max: 5, // Limit connections to avoid hitting Supabase limits
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000, // 30 second timeout
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
