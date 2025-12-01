# MCA Marketing System - Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive marketing system for the MCA Business Management Tool. The system will integrate AI voice agents, outbound/inbound call management, social media automation, content creation, and advertising management - all built around the MCA business model.

---

## Phase 1: Database Schema Extensions

### New Prisma Models Required

```prisma
// ============================================
// MARKETING & CAMPAIGNS
// ============================================

// Lead Sources for Marketing Attribution
enum MarketingChannel {
  AI_VOICE_OUTBOUND
  AI_VOICE_INBOUND
  SMS_CAMPAIGN
  EMAIL_CAMPAIGN
  SOCIAL_FACEBOOK
  SOCIAL_INSTAGRAM
  SOCIAL_LINKEDIN
  SOCIAL_TWITTER
  GOOGLE_ADS
  FACEBOOK_ADS
  LANDING_PAGE
  REFERRAL
  ORGANIC_SEARCH
  DIRECT
}

// Marketing Campaigns
model Campaign {
  id              String          @id @default(cuid())
  companyId       String

  name            String
  description     String?
  type            CampaignType
  channel         MarketingChannel

  // Targeting
  targetAudience  Json?           // Industry, location, revenue range filters

  // Budget & Schedule
  budget          Decimal?        @db.Decimal(10, 2)
  spentAmount     Decimal         @db.Decimal(10, 2) @default(0)
  startDate       DateTime
  endDate         DateTime?

  // Status
  status          CampaignStatus  @default(DRAFT)

  // Performance Metrics (cached)
  impressions     Int             @default(0)
  clicks          Int             @default(0)
  conversions     Int             @default(0)
  leadsGenerated  Int             @default(0)
  dealsCreated    Int             @default(0)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  company         Company         @relation(fields: [companyId], references: [id])
  voiceCampaign   VoiceCampaign?
  contentPosts    ContentPost[]
  adCampaigns     AdCampaign[]
  leads           MarketingLead[]

  @@index([companyId])
  @@map("campaigns")
}

enum CampaignType {
  VOICE_OUTBOUND
  VOICE_INBOUND
  EMAIL
  SMS
  SOCIAL_ORGANIC
  SOCIAL_PAID
  CONTENT
  MULTI_CHANNEL
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

// Marketing Leads (before they become Merchants)
model MarketingLead {
  id              String          @id @default(cuid())
  companyId       String
  campaignId      String?

  // Contact Info
  businessName    String?
  contactName     String?
  email           String?
  phone           String?
  website         String?

  // Business Details
  industry        String?
  annualRevenue   String?         // Range: "100k-250k", "250k-500k", etc.
  monthlyRevenue  String?
  timeInBusiness  String?         // "0-6 months", "6-12 months", etc.

  // Location
  city            String?
  state           String?
  zipCode         String?

  // Lead Scoring
  leadScore       Int             @default(0) // 0-100
  qualificationStatus LeadQualificationStatus @default(NEW)

  // Source Tracking
  source          MarketingChannel
  sourceDetail    String?         // Specific ad, post, or campaign
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?

  // Interaction History
  lastContactedAt DateTime?
  totalCalls      Int             @default(0)
  totalEmails     Int             @default(0)
  totalSms        Int             @default(0)

  // Conversion
  convertedAt     DateTime?
  merchantId      String?         // When converted to merchant
  dealId          String?         // When deal is created

  // Notes
  notes           String?         @db.Text

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  company         Company         @relation(fields: [companyId], references: [id])
  campaign        Campaign?       @relation(fields: [campaignId], references: [id])
  callLogs        CallLog[]
  interactions    LeadInteraction[]

  @@index([companyId])
  @@index([campaignId])
  @@map("marketing_leads")
}

enum LeadQualificationStatus {
  NEW
  CONTACTED
  QUALIFIED
  UNQUALIFIED
  NURTURING
  CONVERTED
  LOST
}

// ============================================
// AI VOICE SYSTEM
// ============================================

model VoiceCampaign {
  id              String          @id @default(cuid())
  campaignId      String          @unique

  // Voice Agent Configuration
  agentId         String          // External voice AI agent ID (Bland.ai, etc.)
  agentName       String
  voiceType       String          // Voice model/persona

  // Script & Prompts
  scriptTemplate  String          @db.Text
  systemPrompt    String          @db.Text
  objectionHandling Json?         // Pre-defined objection responses

  // Call Settings
  callType        VoiceCallType
  maxConcurrentCalls Int          @default(5)
  callsPerDay     Int             @default(100)
  callWindowStart String          @default("09:00") // HH:MM
  callWindowEnd   String          @default("18:00")
  timezone        String          @default("America/New_York")

  // Retry Logic
  maxRetries      Int             @default(3)
  retryInterval   Int             @default(24) // hours

  // Transfer Settings
  transferEnabled Boolean         @default(true)
  transferNumber  String?
  transferConditions Json?        // When to transfer to human

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  campaign        Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  callLogs        CallLog[]

  @@map("voice_campaigns")
}

enum VoiceCallType {
  OUTBOUND_COLD
  OUTBOUND_WARM
  OUTBOUND_FOLLOWUP
  INBOUND_QUALIFICATION
  INBOUND_SUPPORT
}

model CallLog {
  id              String          @id @default(cuid())
  companyId       String
  voiceCampaignId String?
  leadId          String?
  merchantId      String?

  // Call Details
  callType        CallDirection
  fromNumber      String
  toNumber        String

  // Timing
  startedAt       DateTime
  answeredAt      DateTime?
  endedAt         DateTime?
  duration        Int             @default(0) // seconds

  // Outcome
  status          CallStatus
  outcome         CallOutcome?
  dispositionCode String?

  // AI Analysis
  transcript      String?         @db.Text
  summary         String?         @db.Text
  sentiment       CallSentiment?
  keyTopics       String[]
  actionItems     Json?

  // Quality Metrics
  aiConfidence    Decimal?        @db.Decimal(5, 4) // 0-1
  humanReviewNeeded Boolean       @default(false)

  // Recording
  recordingUrl    String?
  recordingDuration Int?

  // Notes
  notes           String?         @db.Text

  createdAt       DateTime        @default(now())

  company         Company         @relation(fields: [companyId], references: [id])
  voiceCampaign   VoiceCampaign?  @relation(fields: [voiceCampaignId], references: [id])
  lead            MarketingLead?  @relation(fields: [leadId], references: [id])

  @@index([companyId])
  @@index([voiceCampaignId])
  @@index([leadId])
  @@map("call_logs")
}

enum CallDirection {
  INBOUND
  OUTBOUND
}

enum CallStatus {
  INITIATED
  RINGING
  IN_PROGRESS
  COMPLETED
  NO_ANSWER
  BUSY
  VOICEMAIL
  FAILED
  TRANSFERRED
}

enum CallOutcome {
  INTERESTED
  NOT_INTERESTED
  CALLBACK_REQUESTED
  QUALIFIED
  DISQUALIFIED
  WRONG_NUMBER
  DO_NOT_CALL
  VOICEMAIL_LEFT
  TRANSFERRED_TO_HUMAN
}

enum CallSentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

model ContentPost {
  id              String          @id @default(cuid())
  companyId       String
  campaignId      String?

  // Content
  title           String?
  content         String          @db.Text
  contentHtml     String?         @db.Text

  // Media
  mediaType       ContentMediaType?
  mediaUrls       String[]
  thumbnailUrl    String?

  // AI Generation
  aiGenerated     Boolean         @default(false)
  aiPrompt        String?         @db.Text
  aiModel         String?

  // Platform Targeting
  platforms       SocialPlatform[]

  // Scheduling
  status          ContentStatus   @default(DRAFT)
  scheduledAt     DateTime?
  publishedAt     DateTime?

  // Performance (aggregated from platform posts)
  impressions     Int             @default(0)
  engagements     Int             @default(0)
  clicks          Int             @default(0)
  shares          Int             @default(0)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  company         Company         @relation(fields: [companyId], references: [id])
  campaign        Campaign?       @relation(fields: [campaignId], references: [id])
  platformPosts   PlatformPost[]

  @@index([companyId])
  @@map("content_posts")
}

enum ContentMediaType {
  IMAGE
  VIDEO
  CAROUSEL
  DOCUMENT
  LINK
}

enum ContentStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
  ARCHIVED
}

enum SocialPlatform {
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  TWITTER
  TIKTOK
  YOUTUBE
}

model PlatformPost {
  id              String          @id @default(cuid())
  contentPostId   String

  platform        SocialPlatform
  platformPostId  String?         // External platform's post ID

  // Platform-specific content (may differ from main post)
  content         String?         @db.Text
  mediaUrls       String[]

  // Status
  status          ContentStatus   @default(SCHEDULED)
  publishedAt     DateTime?
  errorMessage    String?

  // Platform Metrics
  impressions     Int             @default(0)
  engagements     Int             @default(0)
  clicks          Int             @default(0)
  shares          Int             @default(0)
  comments        Int             @default(0)

  lastSyncedAt    DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  contentPost     ContentPost     @relation(fields: [contentPostId], references: [id], onDelete: Cascade)

  @@unique([contentPostId, platform])
  @@map("platform_posts")
}

// Social Media Accounts
model SocialAccount {
  id              String          @id @default(cuid())
  companyId       String

  platform        SocialPlatform
  accountName     String
  accountId       String          // Platform's account ID
  accountUrl      String?

  // OAuth Tokens (encrypted)
  accessToken     String          @db.Text
  refreshToken    String?         @db.Text
  tokenExpiresAt  DateTime?

  // Account Status
  isConnected     Boolean         @default(true)
  lastSyncedAt    DateTime?
  errorMessage    String?

  // Account Metrics
  followers       Int             @default(0)
  following       Int             @default(0)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  company         Company         @relation(fields: [companyId], references: [id])

  @@unique([companyId, platform, accountId])
  @@map("social_accounts")
}

// ============================================
// ADVERTISING
// ============================================

model AdCampaign {
  id              String          @id @default(cuid())
  campaignId      String          // Parent marketing campaign

  platform        AdPlatform
  platformCampaignId String?      // External platform's campaign ID

  // Budget
  dailyBudget     Decimal?        @db.Decimal(10, 2)
  totalBudget     Decimal?        @db.Decimal(10, 2)
  spentAmount     Decimal         @db.Decimal(10, 2) @default(0)

  // Targeting
  targetingConfig Json?           // Platform-specific targeting

  // Creatives
  adCreatives     Json?           // Ad copy, images, etc.

  // Status
  status          AdCampaignStatus @default(DRAFT)

  // Performance Metrics
  impressions     Int             @default(0)
  clicks          Int             @default(0)
  conversions     Int             @default(0)
  costPerClick    Decimal?        @db.Decimal(10, 4)
  costPerConversion Decimal?      @db.Decimal(10, 4)

  lastSyncedAt    DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  campaign        Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@map("ad_campaigns")
}

enum AdPlatform {
  GOOGLE_ADS
  FACEBOOK_ADS
  INSTAGRAM_ADS
  LINKEDIN_ADS
  TWITTER_ADS
  TIKTOK_ADS
}

enum AdCampaignStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  PAUSED
  COMPLETED
  REJECTED
}

// ============================================
// LEAD INTERACTIONS & CRM
// ============================================

model LeadInteraction {
  id              String          @id @default(cuid())
  leadId          String
  userId          String?         // If by a user

  type            InteractionType
  channel         MarketingChannel

  // Details
  subject         String?
  content         String?         @db.Text

  // For emails
  emailId         String?
  emailOpened     Boolean?
  emailClicked    Boolean?

  // For SMS
  smsId           String?
  smsDelivered    Boolean?

  // Outcome
  outcome         String?
  nextSteps       String?

  createdAt       DateTime        @default(now())

  lead            MarketingLead   @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@map("lead_interactions")
}

enum InteractionType {
  CALL_OUTBOUND
  CALL_INBOUND
  EMAIL_SENT
  EMAIL_RECEIVED
  SMS_SENT
  SMS_RECEIVED
  MEETING
  NOTE
  TASK
  SOCIAL_ENGAGEMENT
}

// Content Templates for AI Generation
model ContentTemplate {
  id              String          @id @default(cuid())
  companyId       String?         // Null = global template

  name            String
  description     String?
  category        ContentCategory

  // Template
  template        String          @db.Text
  variables       String[]        // Available merge fields

  // AI Settings
  aiPromptPrefix  String?         @db.Text
  aiPromptSuffix  String?         @db.Text

  // Sample Output
  sampleOutput    String?         @db.Text

  isActive        Boolean         @default(true)

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@map("content_templates")
}

enum ContentCategory {
  SOCIAL_POST
  EMAIL_SUBJECT
  EMAIL_BODY
  SMS
  VOICE_SCRIPT
  BLOG_ARTICLE
  AD_COPY
  LANDING_PAGE
}
```

---

## Phase 2: AI Voice Agent Integration

### Recommended Providers
1. **Bland.ai** - Best for MCA outbound calling (customizable AI voices)
2. **Retell.ai** - Great for inbound qualification
3. **Vapi.ai** - Flexible API for custom integrations
4. **Twilio + OpenAI** - DIY option with full control

### Implementation Structure

```
src/
  lib/
    voice/
      bland-client.ts      # Bland.ai SDK integration
      retell-client.ts     # Retell.ai integration
      voice-manager.ts     # Unified voice agent manager
      scripts/
        outbound-cold.ts   # Cold call script
        outbound-warm.ts   # Warm lead script
        inbound-qualify.ts # Inbound qualification
        followup.ts        # Follow-up scripts

  app/
    (dashboard)/
      marketing/
        page.tsx           # Marketing dashboard
        campaigns/
          page.tsx         # Campaign list
          new/page.tsx     # Create campaign
          [id]/page.tsx    # Campaign details
        voice/
          page.tsx         # Voice campaign manager
          agents/page.tsx  # AI agent configuration
          calls/page.tsx   # Call history & analytics
        content/
          page.tsx         # Content calendar
          create/page.tsx  # Content creator (AI-assisted)
          posts/page.tsx   # Scheduled/published posts
        social/
          page.tsx         # Social accounts overview
          connect/page.tsx # OAuth connection flows
          analytics/page.tsx
        ads/
          page.tsx         # Ad campaigns
          create/page.tsx
          performance/page.tsx
        leads/
          page.tsx         # Marketing leads (pre-merchant)
          [id]/page.tsx    # Lead detail & history

    api/
      marketing/
        campaigns/route.ts
        voice/
          campaigns/route.ts
          calls/route.ts
          webhook/route.ts  # Receive call events
        content/route.ts
        social/
          accounts/route.ts
          posts/route.ts
          webhook/route.ts
        ads/route.ts
        leads/route.ts
```

### Voice Script Example (MCA Outbound)

```typescript
// src/lib/voice/scripts/outbound-cold.ts
export const mcaColdCallScript = {
  systemPrompt: `You are Alex, a friendly business funding specialist from {{company_name}}.
Your goal is to qualify small business owners for merchant cash advance funding.

Key qualification questions:
1. Business type and industry
2. Time in business (need 6+ months)
3. Monthly revenue (need $10k+ minimum)
4. Current funding needs or challenges
5. Best time for a more detailed conversation

Be conversational, not salesy. Listen actively. If they qualify, offer to have a funding specialist call them back or transfer if available.

If they're not interested, politely thank them and ask if they know any business owners who might benefit.`,

  openingScript: `Hi, is this {{contact_name}}? Great! This is Alex calling from {{company_name}}.
I'm reaching out to business owners in {{industry}} to let them know about some funding options that have helped similar businesses grow.
Do you have just a minute to hear about how we've helped businesses like yours access working capital?`,

  qualificationQuestions: [
    "What type of business do you run?",
    "How long have you been in operation?",
    "If you don't mind me asking, roughly what's your monthly revenue?",
    "Are you currently looking for any business funding or have any upcoming needs?",
    "What's the biggest challenge your business is facing right now?"
  ],

  objectionHandling: {
    "not_interested": "I completely understand. Before I let you go, is it the timing, or is there something specific about business funding that doesn't seem right for you?",
    "already_have_funding": "That's great you have options! Many of our clients use us alongside existing funding. Just curious - are you happy with your current rates and terms?",
    "bad_credit": "Actually, we work with a wide range of credit profiles. It's more about your business's cash flow. Would you be open to a quick assessment?",
    "too_busy": "I totally get it - you're running a business! When would be a better time for a 5-minute call? I can call back whenever works for you.",
  },

  closingQualified: `This sounds like something that could really help your business. I'd love to have one of our funding specialists give you a call to discuss specific options and rates. What's the best number and time to reach you?`,

  closingNotQualified: `I appreciate you taking the time to chat. It sounds like the timing isn't quite right, but if things change or you know any business owner friends who might benefit, please keep us in mind. Have a great day!`
};
```

---

## Phase 3: Social Media & Content System

### Platform Integrations
1. **Facebook/Instagram** - Meta Business API
2. **LinkedIn** - LinkedIn Marketing API
3. **Twitter/X** - Twitter API v2
4. **TikTok** - TikTok for Business API

### Content AI Integration
- **OpenAI GPT-4** - For content generation
- **DALL-E 3** - For image generation
- **Runway/Pika** - For video generation (optional)

### Content Calendar Features
- AI-powered content suggestions based on MCA industry trends
- Template library for common post types
- Multi-platform scheduling
- Performance analytics
- A/B testing for posts

---

## Phase 4: Advertising Management

### Ad Platforms
1. **Google Ads** - Search, Display, YouTube
2. **Facebook/Instagram Ads** - Social advertising
3. **LinkedIn Ads** - B2B targeting

### Features
- Campaign creation wizard
- Budget management across platforms
- Automated bid optimization (via platform APIs)
- Conversion tracking integration
- ROI reporting per campaign

---

## Phase 5: Lead Scoring & Qualification

### Scoring Factors
| Factor | Weight | Criteria |
|--------|--------|----------|
| Revenue Range | 25% | Higher revenue = higher score |
| Time in Business | 20% | 12+ months ideal |
| Industry Risk | 15% | A/B tier industries preferred |
| Engagement | 15% | Email opens, call responses |
| Funding Intent | 15% | Expressed need |
| Data Completeness | 10% | Contact info quality |

### Automated Workflows
1. New lead → AI voice qualification call
2. Qualified lead → Add to nurture sequence
3. Hot lead → Alert sales team + create merchant
4. Unqualified → Add to long-term nurture

---

## Phase 6: UI/UX Design

### New Navigation Items (Marketing Section)
```
Marketing (new section)
├── Dashboard          # Overview metrics
├── Campaigns          # All campaigns
├── Voice Agents       # AI voice configuration
│   ├── Agents        # Configure AI agents
│   ├── Scripts       # Manage call scripts
│   └── Call History  # View/analyze calls
├── Content           # Content management
│   ├── Calendar      # Content calendar
│   ├── Create        # AI content creator
│   └── Library       # Templates & assets
├── Social            # Social media
│   ├── Accounts      # Connected accounts
│   ├── Posts         # Scheduled posts
│   └── Analytics     # Social metrics
├── Advertising       # Paid ads
│   ├── Campaigns     # Ad campaigns
│   └── Performance   # Ad analytics
└── Leads             # Marketing leads
    ├── All Leads     # Lead list
    └── Scoring       # Lead scoring rules
```

---

## Phase 7: Third-Party Services Required

### Voice AI
- Bland.ai account + API key
- Twilio phone numbers for inbound/outbound
- Call recording storage (S3/Supabase)

### Social Media
- Meta Business Developer account
- LinkedIn Marketing Developer account
- Twitter Developer account

### Advertising
- Google Ads API access
- Meta Ads API access

### AI/ML
- OpenAI API key
- (Optional) Anthropic API for Claude

---

## Implementation Timeline

### Week 1-2: Database & Core Setup
- [ ] Add Prisma schema extensions
- [ ] Run migrations
- [ ] Set up API routes structure
- [ ] Create base UI components

### Week 3-4: Voice Agent System
- [ ] Integrate Bland.ai SDK
- [ ] Build voice campaign manager UI
- [ ] Create call script editor
- [ ] Implement webhook handlers
- [ ] Add call log & transcript viewer

### Week 5-6: Content & Social
- [ ] Build content calendar UI
- [ ] Integrate AI content generation
- [ ] Set up OAuth flows for social platforms
- [ ] Build post scheduler
- [ ] Add analytics dashboards

### Week 7-8: Advertising & Leads
- [ ] Integrate Google Ads API
- [ ] Integrate Facebook Ads API
- [ ] Build ad campaign manager
- [ ] Implement lead scoring system
- [ ] Build lead management UI

### Week 9-10: Integration & Polish
- [ ] Connect marketing leads to merchant pipeline
- [ ] Add attribution tracking
- [ ] Build comprehensive analytics
- [ ] Testing & bug fixes
- [ ] Documentation

---

## Key API Integrations

### Bland.ai (Voice)
```typescript
// Example API structure
POST /api/marketing/voice/campaigns - Create voice campaign
POST /api/marketing/voice/calls/initiate - Start outbound call
POST /api/marketing/voice/webhook - Receive call events
GET /api/marketing/voice/calls/:id/transcript - Get call transcript
```

### Social Media
```typescript
// Example API structure
POST /api/marketing/social/accounts/connect - OAuth flow
POST /api/marketing/social/posts - Schedule post
GET /api/marketing/social/analytics - Get metrics
```

### Content AI
```typescript
// Example API structure
POST /api/marketing/content/generate - AI generate content
POST /api/marketing/content/images - AI generate image
POST /api/marketing/content/schedule - Schedule content
```

---

## Success Metrics

1. **Voice Campaign Performance**
   - Connection rate > 20%
   - Qualification rate > 15%
   - Conversion to deal > 5%
   - Cost per qualified lead

2. **Content Performance**
   - Engagement rate > 3%
   - Click-through rate > 1%
   - Lead generation per post

3. **Ad Performance**
   - Cost per lead < $50
   - Conversion rate > 2%
   - ROAS > 3x

4. **Overall Marketing**
   - Marketing-attributed deals
   - Customer acquisition cost
   - Lifetime value / CAC ratio
