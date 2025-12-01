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
  console.log("🌱 Seeding database...\n");

  // Seed subscription plans
  console.log("Creating subscription plans...");
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: "plan_starter" },
      update: {},
      create: {
        id: "plan_starter",
        name: "Starter",
        slug: "starter",
        description: "Perfect for small funding companies just getting started",
        monthlyPrice: 99,
        yearlyPrice: 990,
        maxUsers: 3,
        maxMerchants: 100,
        features: [
          "Up to 3 users",
          "100 merchant accounts",
          "Basic underwriting tools",
          "Email support",
          "Standard reports",
        ],
        isActive: true,
      },
    }),
    prisma.plan.upsert({
      where: { id: "plan_professional" },
      update: {},
      create: {
        id: "plan_professional",
        name: "Professional",
        slug: "professional",
        description: "For growing companies with expanded needs",
        monthlyPrice: 299,
        yearlyPrice: 2990,
        maxUsers: 10,
        maxMerchants: 500,
        features: [
          "Up to 10 users",
          "500 merchant accounts",
          "Advanced underwriting",
          "Priority email support",
          "Advanced analytics",
          "Custom deal stages",
          "API access",
        ],
        isActive: true,
      },
    }),
    prisma.plan.upsert({
      where: { id: "plan_enterprise" },
      update: {},
      create: {
        id: "plan_enterprise",
        name: "Enterprise",
        slug: "enterprise",
        description: "Full-featured solution for large operations",
        monthlyPrice: 799,
        yearlyPrice: 7990,
        maxUsers: -1, // Unlimited
        maxMerchants: -1, // Unlimited
        features: [
          "Unlimited users",
          "Unlimited merchant accounts",
          "Full underwriting suite",
          "24/7 phone support",
          "Custom integrations",
          "Dedicated account manager",
          "White-label options",
          "SLA guarantee",
          "Custom reporting",
        ],
        isActive: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${plans.length} plans\n`);

  console.log("Creating users...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mca.com" },
    update: { platformRole: "SUPER_ADMIN" },
    create: {
      email: "admin@mca.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      platformRole: "SUPER_ADMIN",
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
