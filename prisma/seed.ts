import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate random data
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Business name generators
const businessPrefixes = ["ABC", "Premier", "Golden", "Elite", "Metro", "City", "American", "National", "First", "Best"];
const businessTypes = ["Restaurant", "Auto Shop", "Retail Store", "Construction", "Plumbing", "HVAC", "Medical Practice", "Dental Office", "Salon", "Trucking"];
const businessSuffixes = ["LLC", "Inc", "Corp", "Co", "Group", "Services", "Solutions"];

const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "William", "Maria", "James", "Jennifer", "Richard", "Patricia", "Thomas", "Linda"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Thomas", "Moore"];

const cities = [
  { city: "New York", state: "NY", zip: "10001" },
  { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Phoenix", state: "AZ", zip: "85001" },
  { city: "Philadelphia", state: "PA", zip: "19101" },
  { city: "San Antonio", state: "TX", zip: "78201" },
  { city: "San Diego", state: "CA", zip: "92101" },
  { city: "Dallas", state: "TX", zip: "75201" },
  { city: "Miami", state: "FL", zip: "33101" },
];

const dealStages = ["NEW_LEAD", "DOCS_REQUESTED", "DOCS_RECEIVED", "IN_UNDERWRITING", "APPROVED", "CONTRACT_SENT", "CONTRACT_SIGNED", "FUNDED", "DECLINED", "DEAD"] as const;
const leadSources = ["DIRECT", "BROKER", "REFERRAL", "WEBSITE", "EMAIL", "IMPORT"] as const;
const paperGrades = ["A", "B", "C", "D"] as const;
const businessTypeEnums = ["SOLE_PROPRIETORSHIP", "LLC", "CORPORATION", "PARTNERSHIP"] as const;
const industryRiskTiers = ["A", "B", "C", "D"] as const;

async function main() {
  console.log("🌱 Seeding database with comprehensive mock data...\n");

  // Seed subscription plans
  console.log("📋 Creating subscription plans...");
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: "starter" },
      update: {},
      create: {
        name: "Starter",
        slug: "starter",
        description: "Perfect for small funding companies just getting started",
        monthlyPrice: 99,
        yearlyPrice: 990,
        maxUsers: 3,
        maxMerchants: 100,
        maxDealsPerMonth: 25,
        maxStorageGb: 5,
        features: [
          "Up to 3 users",
          "100 merchant accounts",
          "Basic underwriting tools",
          "Email support",
          "Standard reports",
        ],
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "professional" },
      update: {},
      create: {
        name: "Professional",
        slug: "professional",
        description: "For growing companies with expanded needs",
        monthlyPrice: 299,
        yearlyPrice: 2990,
        maxUsers: 10,
        maxMerchants: 500,
        maxDealsPerMonth: 100,
        maxStorageGb: 25,
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
        sortOrder: 2,
      },
    }),
    prisma.plan.upsert({
      where: { slug: "enterprise" },
      update: {},
      create: {
        name: "Enterprise",
        slug: "enterprise",
        description: "Full-featured solution for large operations",
        monthlyPrice: 799,
        yearlyPrice: 7990,
        maxUsers: -1,
        maxMerchants: -1,
        maxDealsPerMonth: -1,
        maxStorageGb: 100,
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
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`  ✓ Created ${plans.length} plans\n`);

  // Create Company (tenant)
  console.log("🏢 Creating company...");
  const company = await prisma.company.upsert({
    where: { slug: "mca-demo" },
    update: {},
    create: {
      name: "MCA Demo Company",
      slug: "mca-demo",
      legalName: "MCA Demo LLC",
      phone: "555-000-0000",
      email: "info@mcademo.com",
      website: "https://mcademo.com",
      address: "100 Finance Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      status: "ACTIVE",
      primaryColor: "#3B82F6",
    },
  });
  console.log(`  ✓ Created company: ${company.name}\n`);

  // Create users
  console.log("👥 Creating users...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mca.com" },
    update: { platformRole: "SUPER_ADMIN", companyId: company.id },
    create: {
      email: "admin@mca.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      platformRole: "SUPER_ADMIN",
      companyId: company.id,
      companyRole: "COMPANY_OWNER",
      isActive: true,
    },
  });

  const underwriter = await prisma.user.upsert({
    where: { email: "underwriter@mca.com" },
    update: { companyId: company.id },
    create: {
      email: "underwriter@mca.com",
      name: "John Underwriter",
      password: hashedPassword,
      role: "UNDERWRITER",
      companyId: company.id,
      companyRole: "UNDERWRITER",
      isActive: true,
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "sales@mca.com" },
    update: { companyId: company.id },
    create: {
      email: "sales@mca.com",
      name: "Jane Sales",
      password: hashedPassword,
      role: "SALES",
      companyId: company.id,
      companyRole: "SALES",
      isActive: true,
    },
  });

  const collections = await prisma.user.upsert({
    where: { email: "collections@mca.com" },
    update: { companyId: company.id },
    create: {
      email: "collections@mca.com",
      name: "Mike Collections",
      password: hashedPassword,
      role: "COLLECTIONS",
      companyId: company.id,
      companyRole: "COLLECTIONS",
      isActive: true,
    },
  });

  console.log(`  ✓ Created 4 users\n`);

  // Create brokers
  console.log("🤝 Creating brokers...");
  const brokers = await Promise.all([
    prisma.broker.upsert({
      where: { email: "broker@abcfunding.com" },
      update: {},
      create: {
        companyId: company.id,
        companyName: "ABC Funding Partners",
        contactName: "Bob Broker",
        email: "broker@abcfunding.com",
        phone: "555-123-4567",
        tier: "PREFERRED",
        commissionRate: 0.12,
        status: "ACTIVE",
        portalEnabled: true,
      },
    }),
    prisma.broker.upsert({
      where: { email: "broker@elitecapital.com" },
      update: {},
      create: {
        companyId: company.id,
        companyName: "Elite Capital Solutions",
        contactName: "Sarah Sterling",
        email: "broker@elitecapital.com",
        phone: "555-234-5678",
        tier: "PREMIUM",
        commissionRate: 0.15,
        status: "ACTIVE",
        portalEnabled: true,
      },
    }),
    prisma.broker.upsert({
      where: { email: "broker@quickfund.com" },
      update: {},
      create: {
        companyId: company.id,
        companyName: "Quick Fund ISO",
        contactName: "Tom Quick",
        email: "broker@quickfund.com",
        phone: "555-345-6789",
        tier: "STANDARD",
        commissionRate: 0.10,
        status: "ACTIVE",
        portalEnabled: true,
      },
    }),
    prisma.broker.upsert({
      where: { email: "broker@premieriso.com" },
      update: {},
      create: {
        companyId: company.id,
        companyName: "Premier ISO Group",
        contactName: "Lisa Premier",
        email: "broker@premieriso.com",
        phone: "555-456-7890",
        tier: "PREFERRED",
        commissionRate: 0.12,
        status: "ACTIVE",
        portalEnabled: true,
      },
    }),
  ]);
  console.log(`  ✓ Created ${brokers.length} brokers\n`);

  // Create merchants with owners and deals
  console.log("🏪 Creating merchants, owners, and deals...");
  const merchantsData = [];

  for (let i = 0; i < 25; i++) {
    const businessName = `${randomElement(businessPrefixes)} ${randomElement(businessTypes)} ${randomElement(businessSuffixes)}`;
    const location = randomElement(cities);
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const ein = `${randomBetween(10, 99)}-${randomBetween(1000000, 9999999)}`;
    const monthlyRevenue = randomBetween(25000, 250000);
    const ficoScore = randomBetween(550, 780);

    try {
      const merchant = await prisma.merchant.create({
        data: {
          companyId: company.id,
          legalName: businessName,
          dbaName: i % 3 === 0 ? `${firstName}'s ${randomElement(businessTypes)}` : null,
          ein: ein,
          businessType: randomElement(businessTypeEnums),
          industryRiskTier: randomElement(industryRiskTiers),
          phone: `555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
          email: `contact@${businessName.toLowerCase().replace(/\s+/g, "").slice(0, 15)}.com`,
          website: i % 2 === 0 ? `https://${businessName.toLowerCase().replace(/\s+/g, "")}.com` : null,
          address: `${randomBetween(100, 9999)} ${randomElement(["Main", "Oak", "Elm", "Park", "Commerce", "Business"])} ${randomElement(["St", "Ave", "Blvd", "Dr", "Way"])}`,
          city: location.city,
          state: location.state,
          zipCode: location.zip,
          dateEstablished: randomDate(new Date(2010, 0, 1), new Date(2023, 0, 1)),
          timeInBusiness: randomBetween(6, 120),
          annualRevenue: monthlyRevenue * 12,
          monthlyRevenue: monthlyRevenue,
          employeeCount: randomBetween(2, 50),
          bankName: randomElement(["Chase", "Bank of America", "Wells Fargo", "TD Bank", "Capital One", "PNC"]),
          status: "ACTIVE",
          salesRepId: sales.id,
          owners: {
            create: {
              firstName: firstName,
              lastName: lastName,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
              phone: `555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
              ownership: 100,
              ficoScore: ficoScore,
              isPrimary: true,
              address: `${randomBetween(100, 9999)} ${randomElement(["Oak", "Maple", "Pine", "Cedar"])} ${randomElement(["St", "Ave", "Ln"])}`,
              city: location.city,
              state: location.state,
              zipCode: location.zip,
              dateOfBirth: randomDate(new Date(1960, 0, 1), new Date(1995, 0, 1)),
            },
          },
        },
      });
      merchantsData.push({ merchant, monthlyRevenue, ficoScore });
    } catch {
      // Skip if EIN already exists
      continue;
    }
  }
  console.log(`  ✓ Created ${merchantsData.length} merchants with owners\n`);

  // Create deals for merchants
  console.log("📝 Creating deals...");
  let dealCount = 0;

  for (const { merchant, monthlyRevenue, ficoScore } of merchantsData) {
    const numDeals = randomBetween(1, 3);

    for (let d = 0; d < numDeals; d++) {
      const requestedAmount = randomBetween(15000, 150000);
      const stage = randomElement(dealStages);
      const source = randomElement(leadSources);
      const broker = source === "BROKER" ? randomElement(brokers) : null;
      const isApproved = ["APPROVED", "CONTRACT_SENT", "CONTRACT_SIGNED", "FUNDED"].includes(stage);
      const isUnderwriting = ["DOCS_RECEIVED", "IN_UNDERWRITING"].includes(stage);

      const factorRate = isApproved ? parseFloat((1.2 + Math.random() * 0.35).toFixed(2)) : null;
      const approvedAmount = isApproved ? Math.round(requestedAmount * (0.7 + Math.random() * 0.3)) : null;
      const termDays = isApproved ? randomElement([60, 90, 120, 180, 240]) : null;

      const deal = await prisma.deal.create({
        data: {
          merchantId: merchant.id,
          requestedAmount: requestedAmount,
          approvedAmount: approvedAmount,
          factorRate: factorRate,
          paybackAmount: approvedAmount && factorRate ? Math.round(approvedAmount * factorRate) : null,
          termDays: termDays,
          dailyPayment: approvedAmount && factorRate && termDays ? Math.round((approvedAmount * factorRate) / termDays) : null,
          stage: stage,
          stageChangedAt: randomDate(new Date(2024, 0, 1), new Date()),
          source: source,
          brokerId: broker?.id,
          commission: broker ? Math.round(requestedAmount * Number(broker.commissionRate)) : null,
          commissionRate: broker ? Number(broker.commissionRate) : null,
          paperGrade: isApproved || isUnderwriting ? randomElement(paperGrades) : null,
          riskScore: isApproved || isUnderwriting ? randomBetween(45, 95) : null,
          stackingDetected: Math.random() > 0.8,
          existingPositions: Math.random() > 0.7 ? randomBetween(1, 3) : 0,
          decisionDate: isApproved || stage === "DECLINED" ? randomDate(new Date(2024, 6, 1), new Date()) : null,
          decisionNotes: isApproved ? "Approved based on strong revenue and credit profile" : stage === "DECLINED" ? "Declined due to high risk indicators" : null,
          submittedAt: randomDate(new Date(2024, 0, 1), new Date()),
          fundedAt: stage === "FUNDED" ? randomDate(new Date(2024, 6, 1), new Date()) : null,
          underwriterId: isUnderwriting || isApproved ? underwriter.id : null,
          createdById: sales.id,
        },
      });

      // Create stage history
      await prisma.dealStageHistory.create({
        data: {
          dealId: deal.id,
          toStage: stage,
          changedBy: sales.id,
          notes: `Deal created with stage: ${stage}`,
        },
      });

      // Create bank analysis for deals in underwriting or approved
      if (isUnderwriting || isApproved) {
        const avgDailyBalance = randomBetween(5000, 50000);
        await prisma.bankAnalysis.create({
          data: {
            dealId: deal.id,
            periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            periodEnd: new Date(),
            monthsAnalyzed: 3,
            avgDailyBalance: avgDailyBalance,
            minBalance: Math.round(avgDailyBalance * 0.3),
            maxBalance: Math.round(avgDailyBalance * 2.5),
            endingBalance: Math.round(avgDailyBalance * (0.8 + Math.random() * 0.4)),
            totalDeposits: monthlyRevenue * 3,
            depositCount: randomBetween(60, 200),
            avgDeposit: Math.round((monthlyRevenue * 3) / randomBetween(60, 200)),
            depositDaysCount: randomBetween(50, 70),
            nsfCount: randomBetween(0, 5),
            nsfAmount: randomBetween(0, 500),
            overdraftCount: randomBetween(0, 3),
            revenueTrend: randomElement(["GROWING", "STABLE", "DECLINING"]),
          },
        });
      }

      dealCount++;
    }
  }
  console.log(`  ✓ Created ${dealCount} deals\n`);

  // Create CRM Contacts
  console.log("📇 Creating CRM contacts...");
  const contacts = [];
  for (let i = 0; i < 30; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const location = randomElement(cities);

    const contact = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: firstName,
        lastName: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
        mobile: `555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
        title: randomElement(["Owner", "CEO", "CFO", "Manager", "Director", "President"]),
        contactType: randomElement(["BUSINESS_OWNER", "GUARANTOR", "ACCOUNTANT", "BROKER"]),
        status: "ACTIVE",
        businessName: `${randomElement(businessPrefixes)} ${randomElement(businessTypes)}`,
        industry: randomElement(["Restaurant", "Retail", "Construction", "Healthcare", "Transportation"]),
        city: location.city,
        state: location.state,
        zipCode: location.zip,
        leadScore: randomBetween(20, 95),
        emailOptIn: true,
        smsOptIn: Math.random() > 0.3,
        callOptIn: true,
        source: randomElement(["Website", "Referral", "Cold Call", "Marketing"]),
        tags: [randomElement(["hot-lead", "follow-up", "qualified", "new"])],
        lastContactedAt: randomDate(new Date(2024, 6, 1), new Date()),
      },
    });
    contacts.push(contact);
  }
  console.log(`  ✓ Created ${contacts.length} CRM contacts\n`);

  // Create CRM Tasks
  console.log("✅ Creating CRM tasks...");
  const taskCategories = ["FOLLOW_UP_CALL", "DOCUMENT_REQUEST", "DOCUMENT_REVIEW", "CREDIT_REVIEW", "UNDERWRITING", "GENERAL"] as const;
  const taskPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
  const taskStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

  for (let i = 0; i < 20; i++) {
    const contact = randomElement(contacts);
    await prisma.crmTask.create({
      data: {
        companyId: company.id,
        title: randomElement([
          "Follow up on application",
          "Request bank statements",
          "Review submitted documents",
          "Call to discuss terms",
          "Send contract for signature",
          "Verify business information",
          "Schedule meeting",
          "Process renewal request",
        ]),
        description: "Task created for demo purposes",
        category: randomElement(taskCategories),
        priority: randomElement(taskPriorities),
        status: randomElement(taskStatuses),
        dueDate: randomDate(new Date(), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        assignedToId: randomElement([sales.id, underwriter.id, collections.id]),
        assignedById: admin.id,
        contactId: contact.id,
      },
    });
  }
  console.log(`  ✓ Created 20 CRM tasks\n`);

  // Create CRM Activities
  console.log("📊 Creating CRM activities...");
  const activityTypes = ["CALL_OUTBOUND", "CALL_INBOUND", "EMAIL_SENT", "EMAIL_RECEIVED", "MEETING_COMPLETED", "NOTE_ADDED"] as const;

  for (let i = 0; i < 50; i++) {
    const contact = randomElement(contacts);
    await prisma.activity.create({
      data: {
        companyId: company.id,
        contactId: contact.id,
        type: randomElement(activityTypes),
        subject: randomElement([
          "Initial call",
          "Follow up discussion",
          "Document request",
          "Application review",
          "Terms negotiation",
          "Contract discussion",
        ]),
        description: "Activity logged for demo purposes",
        activityDate: randomDate(new Date(2024, 6, 1), new Date()),
        duration: randomBetween(5, 60),
        outcome: randomElement(["Successful", "Voicemail", "Callback scheduled", "Not interested", "Needs more info"]),
        userId: randomElement([sales.id, underwriter.id]),
        isAutoLogged: Math.random() > 0.7,
      },
    });
  }
  console.log(`  ✓ Created 50 CRM activities\n`);

  // Create Marketing Campaigns
  console.log("📢 Creating marketing campaigns...");
  const campaignTypes = ["VOICE_OUTBOUND", "EMAIL", "SMS", "SOCIAL_ORGANIC"] as const;
  const campaignStatuses = ["ACTIVE", "COMPLETED", "DRAFT"] as const;
  const marketingChannels = ["AI_VOICE_OUTBOUND", "EMAIL_CAMPAIGN", "SMS_CAMPAIGN", "SOCIAL_FACEBOOK"] as const;

  const campaigns = [];
  for (let i = 0; i < 8; i++) {
    const campaign = await prisma.campaign.create({
      data: {
        companyId: company.id,
        name: randomElement([
          "Q4 Outreach Campaign",
          "Restaurant Industry Push",
          "Holiday Funding Drive",
          "New Business Welcome",
          "Renewal Campaign",
          "Referral Program",
          "Social Media Blitz",
          "Email Nurture Sequence",
        ]) + ` ${i + 1}`,
        description: "Marketing campaign for demo purposes",
        type: randomElement(campaignTypes),
        channel: randomElement(marketingChannels),
        budget: randomBetween(1000, 10000),
        spentAmount: randomBetween(0, 5000),
        startDate: randomDate(new Date(2024, 6, 1), new Date()),
        endDate: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        status: randomElement(campaignStatuses),
        impressions: randomBetween(1000, 50000),
        clicks: randomBetween(100, 2000),
        conversions: randomBetween(5, 100),
        leadsGenerated: randomBetween(10, 200),
        dealsCreated: randomBetween(2, 30),
      },
    });
    campaigns.push(campaign);
  }
  console.log(`  ✓ Created ${campaigns.length} marketing campaigns\n`);

  // Create Marketing Leads
  console.log("🎯 Creating marketing leads...");
  const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "CONVERTED"] as const;

  for (let i = 0; i < 40; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const location = randomElement(cities);

    await prisma.marketingLead.create({
      data: {
        companyId: company.id,
        campaignId: randomElement(campaigns).id,
        businessName: `${randomElement(businessPrefixes)} ${randomElement(businessTypes)}`,
        contactName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@business.com`,
        phone: `555-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
        industry: randomElement(["Restaurant", "Retail", "Construction", "Healthcare", "Transportation", "Manufacturing"]),
        annualRevenue: randomElement(["100k-250k", "250k-500k", "500k-1M", "1M-2.5M", "2.5M+"]),
        monthlyRevenue: randomElement(["10k-25k", "25k-50k", "50k-100k", "100k-250k"]),
        timeInBusiness: randomElement(["0-6 months", "6-12 months", "1-2 years", "2-5 years", "5+ years"]),
        city: location.city,
        state: location.state,
        zipCode: location.zip,
        leadScore: randomBetween(10, 100),
        qualificationStatus: randomElement(leadStatuses),
        source: randomElement(marketingChannels),
        totalCalls: randomBetween(0, 10),
        totalEmails: randomBetween(0, 15),
        lastContactedAt: Math.random() > 0.3 ? randomDate(new Date(2024, 6, 1), new Date()) : null,
      },
    });
  }
  console.log(`  ✓ Created 40 marketing leads\n`);

  // Create Email Messages
  console.log("📧 Creating email messages...");
  const emailStatuses = ["SENT", "DELIVERED", "OPENED", "CLICKED", "REPLIED"] as const;

  for (let i = 0; i < 25; i++) {
    const contact = randomElement(contacts);
    await prisma.emailMessage.create({
      data: {
        companyId: company.id,
        direction: Math.random() > 0.3 ? "OUTBOUND" : "INBOUND",
        subject: randomElement([
          "Funding opportunity for your business",
          "Re: Application status",
          "Documents received - next steps",
          "Your approval is ready!",
          "Follow up on our conversation",
          "New offer available",
        ]),
        body: "This is a demo email message content for testing purposes.",
        fromEmail: Math.random() > 0.5 ? "sales@mca.com" : contact.email || "unknown@email.com",
        fromName: Math.random() > 0.5 ? "MCA Sales Team" : `${contact.firstName} ${contact.lastName}`,
        toEmail: Math.random() > 0.5 ? contact.email || "contact@email.com" : "sales@mca.com",
        toName: Math.random() > 0.5 ? `${contact.firstName} ${contact.lastName}` : "MCA Sales Team",
        status: randomElement(emailStatuses),
        sentAt: randomDate(new Date(2024, 6, 1), new Date()),
        openCount: randomBetween(0, 5),
        clickCount: randomBetween(0, 3),
        contactId: contact.id,
        userId: sales.id,
      },
    });
  }
  console.log(`  ✓ Created 25 email messages\n`);

  // Create Notifications
  console.log("🔔 Creating notifications...");
  const notificationTypes = ["DEAL_ASSIGNED", "DEAL_STAGE_CHANGE", "DOCUMENT_UPLOADED", "PAYMENT_RECEIVED", "SYSTEM"] as const;

  for (const user of [admin, underwriter, sales, collections]) {
    for (let i = 0; i < 5; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: randomElement(notificationTypes),
          title: randomElement([
            "New deal assigned",
            "Document uploaded",
            "Payment received",
            "Deal approved",
            "Action required",
            "System update",
          ]),
          message: "This is a demo notification for testing purposes.",
          read: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? randomDate(new Date(2024, 9, 1), new Date()) : null,
        },
      });
    }
  }
  console.log(`  ✓ Created 20 notifications\n`);

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Seeding complete!\n");
  console.log("📊 Summary:");
  console.log(`   • ${plans.length} subscription plans`);
  console.log(`   • 1 company`);
  console.log(`   • 4 users`);
  console.log(`   • ${brokers.length} brokers`);
  console.log(`   • ${merchantsData.length} merchants`);
  console.log(`   • ${dealCount} deals`);
  console.log(`   • ${contacts.length} CRM contacts`);
  console.log(`   • 20 CRM tasks`);
  console.log(`   • 50 CRM activities`);
  console.log(`   • ${campaigns.length} marketing campaigns`);
  console.log(`   • 40 marketing leads`);
  console.log(`   • 25 email messages`);
  console.log(`   • 20 notifications`);
  console.log("");
  console.log("🔐 Login credentials:");
  console.log("   Admin:       admin@mca.com / admin123");
  console.log("   Underwriter: underwriter@mca.com / admin123");
  console.log("   Sales:       sales@mca.com / admin123");
  console.log("   Collections: collections@mca.com / admin123");
  console.log("═══════════════════════════════════════════════════════");
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
