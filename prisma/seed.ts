import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mca.com" },
    update: {},
    create: {
      email: "admin@mca.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Created admin user:", admin.email);

  // Create underwriter user
  const underwriter = await prisma.user.upsert({
    where: { email: "underwriter@mca.com" },
    update: {},
    create: {
      email: "underwriter@mca.com",
      name: "John Underwriter",
      password: hashedPassword,
      role: "UNDERWRITER",
      isActive: true,
    },
  });

  console.log("Created underwriter user:", underwriter.email);

  // Create sales user
  const sales = await prisma.user.upsert({
    where: { email: "sales@mca.com" },
    update: {},
    create: {
      email: "sales@mca.com",
      name: "Jane Sales",
      password: hashedPassword,
      role: "SALES",
      isActive: true,
    },
  });

  console.log("Created sales user:", sales.email);

  // Create sample broker
  const broker = await prisma.broker.upsert({
    where: { email: "broker@example.com" },
    update: {},
    create: {
      companyName: "ABC Funding Partners",
      contactName: "Bob Broker",
      email: "broker@example.com",
      phone: "555-123-4567",
      tier: "PREFERRED",
      commissionRate: 0.12,
      status: "ACTIVE",
    },
  });

  console.log("Created sample broker:", broker.companyName);

  // Create sample merchant
  const merchant = await prisma.merchant.upsert({
    where: { ein: "12-3456789" },
    update: {},
    create: {
      legalName: "ABC Restaurant LLC",
      dbaName: "Joe's Diner",
      ein: "12-3456789",
      businessType: "LLC",
      phone: "555-987-6543",
      email: "joe@joesdiner.com",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      monthlyRevenue: 75000,
      timeInBusiness: 36,
      industryCode: "722511",
      status: "ACTIVE",
      salesRepId: sales.id,
      owners: {
        create: {
          firstName: "Joe",
          lastName: "Smith",
          email: "joe@joesdiner.com",
          phone: "555-987-6543",
          ownership: 100,
          ficoScore: 680,
          isPrimary: true,
        },
      },
    },
  });

  console.log("Created sample merchant:", merchant.legalName);

  // Create sample deal
  const deal = await prisma.deal.create({
    data: {
      merchantId: merchant.id,
      requestedAmount: 50000,
      source: "DIRECT",
      stage: "NEW_LEAD",
      createdById: sales.id,
    },
  });

  await prisma.dealStageHistory.create({
    data: {
      dealId: deal.id,
      toStage: "NEW_LEAD",
      changedBy: sales.id,
    },
  });

  console.log("Created sample deal for:", merchant.legalName);

  console.log("\nSeeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin: admin@mca.com / admin123");
  console.log("  Underwriter: underwriter@mca.com / admin123");
  console.log("  Sales: sales@mca.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
