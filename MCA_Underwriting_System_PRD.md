# MCA Underwriting System
## Product Requirements Document

**Version 2.0 | December 2025**

**BotMakers Inc.**
*A Subsidiary of BioQuest Inc. (BQST)*

*Reference Architecture: Apache Fineract, NextCRM, DigiFi LOS*

---

# Table of Contents

1. Executive Summary
2. System Architecture
3. CRM & Pipeline Management
4. Underwriting Engine
5. Document Management
6. Compliance & Regulatory
7. Payment Processing
8. Reporting & Analytics
9. Third-Party Integrations
10. Security & Infrastructure
11. Implementation Roadmap
12. Glossary
13. Reference Architecture

---

# 1. Executive Summary

## 1.1 Overview

This Product Requirements Document (PRD) defines the complete specifications for a Merchant Cash Advance (MCA) underwriting and loan management system. The platform will enable end-to-end management of the MCA lifecycle, from lead capture through funding, servicing, and collections.

The system architecture is informed by industry-leading open-source platforms including Apache Fineract (core banking), NextCRM (modern CRM patterns), and DigiFi (loan origination), adapted specifically for the unique requirements of the MCA industry.

## 1.2 Business Objectives

1. Reduce average funding time from 3+ days to under 24 hours through automated underwriting
2. Decrease default rates by 25% through improved risk scoring and stacking detection
3. Improve operational efficiency by 60% with workflow automation and document OCR
4. Ensure 100% compliance with state disclosure requirements (CA, NY, VA, UT)
5. Enable portfolio scaling from $5M to $50M+ monthly funding volume

## 1.3 Target Users

| User Type | Primary Functions | Access Level |
|-----------|-------------------|--------------|
| Underwriters | Credit analysis, risk assessment, deal approval/decline | Full system access to underwriting module |
| Sales Representatives | Lead management, deal submission, client communication | CRM, documents, limited underwriting view |
| Brokers/ISOs | Deal submission, status tracking, commission reports | Broker portal only (white-labeled) |
| Collections | Payment tracking, NSF handling, default management | Payments, advances, collections workflows |
| Compliance Officers | Audit review, disclosure management, regulatory reporting | Audit logs, compliance reports, UCC filings |
| Executives | Portfolio oversight, performance analytics, strategy | Dashboards, reports, admin functions |
| Merchants | Application status, document upload, payment history | Self-service portal only |

---

# 2. System Architecture

## 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 15 with App Router, React 19, TypeScript 5.x |
| UI Components | shadcn/ui, Tailwind CSS, Tremor (charts), React Email |
| Database | PostgreSQL 16+ (Supabase) with Row Level Security |
| ORM | Prisma with type-safe queries and migrations |
| Authentication | Auth.js (NextAuth) with OAuth, MFA support |
| File Storage | Supabase Storage or AWS S3 with pre-signed URLs |
| Caching | Redis for session management and rate limiting |
| Background Jobs | Inngest or BullMQ for async processing |
| API | REST API with OpenAPI/Swagger documentation |
| Deployment | Vercel (frontend), Railway/Render (backend services) |

## 2.2 Core Modules

| Module | Description | Key Integrations |
|--------|-------------|------------------|
| CRM & Pipeline | Lead management, deal tracking, broker/ISO management | Email, calendar, webhooks |
| Underwriting Engine | Credit analysis, risk scoring, decision automation | Credit bureaus, OCR providers |
| Document Processing | Upload, OCR, verification, e-signature workflows | Ocrolus, DocuSign, Plaid |
| Payment Processing | ACH disbursement, collections, reconciliation | ACH processors, banking APIs |
| Compliance | State disclosures, UCC filings, audit trails | State SOS APIs, document gen |
| Analytics | Dashboards, reports, portfolio metrics | BI tools, export APIs |

---

# 3. CRM & Pipeline Management

## 3.1 Lead Intake Channels

- **Web Application Forms**: Customizable forms with field validation and auto-save
- **Broker Portal API**: RESTful API for ISO/broker deal submissions with API key auth
- **Email Parser**: Automated extraction from formatted email applications
- **CSV/Excel Import**: Bulk lead upload with field mapping and validation

## 3.2 Deal Pipeline Stages

| Stage | Description | Auto-Transitions |
|-------|-------------|------------------|
| New Lead | Initial submission received, pending initial review | → Docs Requested (on assign) |
| Docs Requested | Application accepted, required documents communicated | → Docs Received (on upload) |
| Docs Received | All required documents uploaded, pending review | → In Underwriting (manual) |
| In Underwriting | Active credit and bank analysis in progress | → Approved/Declined (on decision) |
| Approved | Underwriting approved, offer terms finalized | → Contract Sent (on generate) |
| Contract Sent | Agreement sent for electronic signature | → Contract Signed (webhook) |
| Contract Signed | All parties signed, pending funding | → Funded (on ACH confirm) |
| Funded | Funds disbursed, advance active | Creates Advance record |
| Declined | Application declined with reason codes | Triggers decline notification |
| Dead | Deal withdrawn, stale, or duplicate | No further processing |

## 3.3 Broker/ISO Management

| Feature | Implementation |
|---------|----------------|
| Commission Tiers | Standard (10%), Preferred (12%), Premium (15%) based on volume and performance |
| Clawback Period | 90-day default: 100% clawback, 91-180 days: 50% clawback, 180+ days: no clawback |
| Payment Schedule | Weekly ACH on Fridays for commissions earned through prior week |
| Portal Features | Deal submission, status tracking, commission statements, marketing materials |

---

# 4. Underwriting Engine

## 4.1 Paper Grade Classification

| Grade | FICO Range | Factor Rate | Characteristics |
|-------|------------|-------------|-----------------|
| A | 650+ | 1.15 - 1.25 | Strong credit, consistent deposits, 12+ months TIB, minimal NSFs |
| B | 575 - 649 | 1.26 - 1.35 | Moderate credit, stable cash flow, 6-12 months TIB, few NSFs |
| C | 500 - 574 | 1.36 - 1.45 | Below average credit, variable deposits, some NSFs or stacking |
| D | < 500 | 1.46 - 1.55+ | High risk, existing positions, higher NSF frequency, requires senior approval |

## 4.2 Risk Score Components

| Factor | Weight | Scoring Criteria |
|--------|--------|------------------|
| Credit Score (FICO) | 20% | 650+ = max points, scaled down to 500 floor |
| Average Daily Balance | 15% | Higher balance relative to request = higher score |
| Deposit Consistency | 15% | Regular deposits on 20+ days/month = max points |
| NSF Frequency | 15% | 0 NSFs = max, >5/month = minimum points |
| Time in Business | 10% | 24+ months = max, 6-12 months = moderate |
| Industry Risk Tier | 10% | A-tier industries = max, D-tier = reduced points |
| Existing MCA Load | 10% | No stacking = max, >20% daily load = minimum |
| Revenue Stability | 5% | Growing/stable trend = higher, declining = lower |

## 4.3 Stacking Detection

Critical for default prevention (40% of MCA defaults linked to multiple positions per LendIt Fintech 2024):

- **UCC Search**: Automated Secretary of State database queries for existing filings
- **Bank Statement Analysis**: Pattern recognition for recurring ACH debits to known MCA funders
- **Self-Disclosure Verification**: Cross-reference application answers against detected positions
- **Payment Load Calculation**: Total daily MCA obligations must not exceed 15-20% of average daily deposits

**Position Limits:**
- 1st Position: Standard underwriting criteria apply
- 2nd Position: Requires FICO 600+, stronger cash flow, reduced advance amount
- 3rd+ Position: Auto-decline or requires VP-level approval

## 4.4 Automated Decision Rules

**Auto-Approve Criteria (all must be met):**
- FICO score ≥ 650
- Time in business ≥ 12 months
- Average daily balance ≥ $5,000
- NSF count ≤ 2 in past 3 months
- No existing MCA positions (1st position only)
- Request amount ≤ 1x monthly revenue

**Auto-Decline Criteria (any triggers decline):**
- FICO score < 500
- Time in business < 6 months
- Monthly revenue < $10,000
- Active bankruptcy or legal judgment
- 3+ existing MCA positions
- NSF count > 10 in past 3 months
- Prohibited industry (gambling, adult, cannabis, firearms)

---

# 5. Document Management

## 5.1 Required Documents

| Document Type | Required | Conditional | Verification Method |
|---------------|----------|-------------|---------------------|
| Bank Statements (3-6 mo) | ✓ Mandatory | - | OCR + manual review |
| Signed Application | ✓ Mandatory | - | E-signature verification |
| Government-Issued ID | ✓ Mandatory | - | ID verification API |
| Voided Check | ✓ Mandatory | - | OCR + ACH validation |
| CC Processing Statements | - | > $15K/mo CC volume | OCR extraction |
| Tax Returns (1-2 years) | - | > $100K request | IRS transcript verification |
| Business License | - | Required industries | State registry lookup |

## 5.2 Bank Statement OCR Extraction

Automated extraction using Ocrolus or KlearStack:

- **Account Information**: Bank name, account number (masked), account type, statement period
- **Balance Metrics**: Opening, closing, minimum, maximum, average daily balance
- **Deposit Analysis**: Total deposits, deposit count, average deposit, largest deposit, deposit frequency
- **NSF Detection**: Count, dates, amounts of non-sufficient funds and overdrafts
- **MCA Payment Identification**: Recurring ACH debits matching known funder patterns
- **Cash Flow Patterns**: Daily inflow/outflow, net cash flow, revenue trend indicators

## 5.3 E-Signature Integration

| Platform | Best For | Key Features | Pricing |
|----------|----------|--------------|---------|
| DocuSign | Enterprise, complex workflows | 900+ integrations, templates, bulk send | $45-65/user/month |
| Dropbox Sign | Cost-effective, simple flows | API-first, good UX, templates | $20-35/user/month |
| Blueink | SMS-focused, high response | SMS delivery, 45% higher response rate | $25-40/user/month |

---

# 6. Compliance & Regulatory

## 6.1 State Disclosure Requirements

| State | Regulation | Required Disclosures |
|-------|------------|----------------------|
| California | SB 1235 (DFPI) | Total advance amount, total payback amount, total finance charge, APR equivalent, payment schedule, prepayment terms |
| New York | SB 5470 (NYDFS) | Financing amount, finance charge, APR, total repayment amount, payment amounts and frequency, prepayment policies |
| Virginia | Commercial Financing | Registration required + disclosure of key financing terms similar to NY requirements |
| Utah | Commercial Registration | Registration required for >5 transactions/year, disclosure best practices recommended |

## 6.2 UCC Filing Automation

- **Auto-Generate UCC-1**: Upon funding approval, system generates filing with merchant and collateral details
- **Electronic Filing**: Integration with state Secretary of State e-filing portals
- **Status Tracking**: Monitor filing acceptance, rejection, and amendments
- **5-Year Renewal**: Automated reminders 90 days before expiration with one-click continuation (UCC-3)
- **Termination**: Auto-generate UCC-3 termination upon advance payoff

## 6.3 Audit Trail Requirements

Following Apache Fineract patterns for comprehensive audit logging:

- **Timestamped Logging**: Every action logged with UTC timestamp, user ID, IP address, session ID
- **Non-Editable Logs**: Append-only audit tables with no UPDATE/DELETE permissions
- **Document Version History**: Full version control for all uploaded and generated documents
- **7-Year Retention**: All records retained for minimum 7 years per regulatory requirements

---

# 7. Payment Processing

## 7.1 Disbursement Methods

- **Same-Day ACH**: Standard disbursement for verified accounts (cutoff 2pm ET)
- **Wire Transfer**: For expedited funding >$100K or merchant request ($25 fee)
- **Split Funding**: Direct deposit split with payment processor for CC-heavy businesses
- **Commission Disbursement**: Automated broker commission payments on funding

## 7.2 Collection Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| Fixed Daily ACH | Consistent daily debit of predetermined amount | Most common, predictable cash flow |
| Fixed Weekly ACH | Weekly debit on specified day (Mon-Fri) | Merchants with weekly deposit patterns |
| Split Withholding | Percentage of daily credit card settlements | Restaurants, retail with high CC volume |
| Lockbox | Direct deposit account with controlled access | Higher risk, larger positions |

## 7.3 ACH Return Handling

| Code | Description | Action | Impact |
|------|-------------|--------|--------|
| R01 | Insufficient Funds | Auto-retry in 3 days | NSF fee applied |
| R02 | Account Closed | Flag for review | Request new account |
| R03 | No Account/Unable to Locate | Stop processing | Collections escalation |
| R07 | Authorization Revoked | Stop processing | Legal/collections review |
| R08 | Payment Stopped | Stop processing | Merchant contact required |
| R09 | Uncollected Funds | Auto-retry in 3 days | NSF fee applied |
| R10 | Customer Advises Unauthorized | Stop processing | Legal review |
| R29 | Corporate Customer Advises Not Authorized | Stop processing | Legal review |

## 7.4 Recommended ACH Providers

| Provider | Strengths | Pricing |
|----------|-----------|---------|
| Actum Processing | MCA-specialized, high-risk friendly, same-day ACH | $0.30-0.50/transaction + monthly fee |
| GoACH | No reserves, no caps, MCA-focused, white-label | $0.25-0.40/transaction |
| Dwolla | API-first, developer-friendly, Plaid integration | $0.25/transaction, $250/mo minimum |

---

# 8. Reporting & Analytics

## 8.1 Executive Dashboard KPIs

| Category | Metric | Target | Frequency |
|----------|--------|--------|-----------|
| Volume | Monthly Funded Amount | $5M+ | Daily |
| Volume | Average Deal Size | $40-60K | Daily |
| Conversion | Lead to Funded Rate | 15-25% | Weekly |
| Conversion | Approval Rate | 40-60% | Weekly |
| Performance | Default Rate (6-mo) | < 10% | Monthly |
| Performance | Collection Rate | > 95% | Daily |
| Operational | Avg Time to Fund | < 24 hours | Daily |
| Operational | Underwriting SLA Compliance | > 95% | Weekly |
| Profitability | Portfolio Yield | 25-35% | Monthly |
| Profitability | Net Collection Margin | > 15% | Monthly |

## 8.2 Standard Reports

- **Daily Funding Report**: All advances funded with amounts, terms, broker, and underwriter
- **Pipeline Report**: Active deals by stage with aging, assigned user, and next action
- **Collections Report**: Payment status, returns, NSFs, and aging by advance
- **Commission Report**: Broker earnings, pending payments, and clawback exposure
- **Portfolio Aging Report**: RTR by age bucket (current, 1-30, 31-60, 61-90, 90+)
- **Underwriting Performance**: Approval rate, default rate, and volume by underwriter

---

# 9. Third-Party Integrations

## 9.1 Integration Summary

| Category | Recommended | Alternative | Est. Cost/Deal |
|----------|-------------|-------------|----------------|
| Credit Bureau | CRS Credit API | iSoftpull, MeridianLink | $3-5 |
| Bank Verification | Plaid | DecisionLogic, MX | $1-3 |
| Bank Statement OCR | Ocrolus | KlearStack, Parseur | $5-15 |
| E-Signature | DocuSign | Dropbox Sign, Blueink | $2-5 |
| ACH Processing | Actum | GoACH, Dwolla | $0.50-1.00 |
| UCC Filing | CSC Global | CT Corporation | $20-40 |

*Total estimated integration cost per funded deal: $30-70 depending on volume and provider negotiations.*

---

# 10. Security & Infrastructure

## 10.1 Security Requirements

- **SOC 2 Type II**: Compliance certification required within 12 months of launch
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit
- **MFA**: Required for all internal users, optional for merchant portal
- **RBAC**: Role-based access control with principle of least privilege
- **IP Whitelisting**: Option for API access and admin functions
- **Penetration Testing**: Annual third-party security assessment

## 10.2 Role-Based Access Control

| Permission | Admin | Underwriter | Sales | Collections | Broker |
|------------|-------|-------------|-------|-------------|--------|
| View Merchants | ✓ | ✓ | ✓ | ✓ | Own only |
| Create Deals | ✓ | ✓ | ✓ | - | ✓ |
| Approve/Decline | ✓ | ✓ | - | - | - |
| Process Payments | ✓ | - | - | ✓ | - |
| View Reports | All | Underwriting | Sales | Collections | Commissions |
| System Settings | ✓ | - | - | - | - |

## 10.3 Infrastructure Requirements

- **Uptime SLA**: 99.9% availability (< 8.76 hours downtime per year)
- **Backup**: Daily automated backups with 30-day retention, geo-redundant storage
- **Recovery**: RTO < 4 hours, RPO < 1 hour for critical systems
- **Scalability**: Horizontal scaling for API and worker processes
- **CDN**: Global content delivery for static assets and portal access

---

# 11. Implementation Roadmap

## 11.1 Phase Overview

| Phase | Timeline | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| Phase 1 | Weeks 1-8 | Foundation & Core CRM | Auth, database, basic CRM, document upload |
| Phase 2 | Weeks 9-16 | Underwriting Core | Credit bureau, OCR, risk scoring, decision engine |
| Phase 3 | Weeks 17-22 | Contracts & Compliance | E-signature, state disclosures, UCC automation |
| Phase 4 | Weeks 23-30 | Payments & Servicing | ACH integration, collections, payment schedules |
| Phase 5 | Weeks 31-36 | Portals & Analytics | Merchant portal, broker portal, dashboards |
| Phase 6 | Weeks 37-40 | Polish & Launch | Security audit, UAT, production deployment |

## 11.2 Phase 1: Foundation (Weeks 1-8)

Core infrastructure and CRM setup based on NextCRM patterns:

- Next.js 15 project setup with TypeScript, Tailwind, shadcn/ui
- PostgreSQL database with Prisma ORM and initial schema migration
- Auth.js authentication with email/password and Google OAuth
- Merchant and owner CRUD operations
- Deal pipeline with stage management
- Document upload with Supabase Storage

## 11.3 Phase 2: Underwriting Core (Weeks 9-16)

Underwriting engine implementation following Fineract patterns:

- Credit bureau API integration (CRS Credit or iSoftpull)
- Bank statement OCR integration (Ocrolus)
- Risk scoring algorithm implementation
- Paper grade classification engine
- Stacking detection with UCC search
- Auto-approve/auto-decline rules engine

## 11.4 Phase 3: Contracts & Compliance (Weeks 17-22)

- E-signature integration (DocuSign or Dropbox Sign)
- Contract template management and generation
- State-specific disclosure generation (CA, NY, VA, UT)
- UCC-1 auto-generation and e-filing integration
- Audit logging implementation

## 11.5 Phase 4: Payments & Servicing (Weeks 23-30)

- ACH processor integration (Actum or GoACH)
- Disbursement workflow with approval gates
- Payment schedule generation and management
- ACH return handling with retry logic
- Collections workflow and escalation
- Commission calculation and payment

## 11.6 Phase 5: Portals & Analytics (Weeks 31-36)

- Merchant self-service portal
- Broker/ISO portal with white-label support
- Executive dashboard with Tremor charts
- Standard report generation
- Email notifications with React Email

## 11.7 Phase 6: Polish & Launch (Weeks 37-40)

- Third-party security penetration testing
- User acceptance testing with pilot users
- Performance optimization and load testing
- Documentation and training materials
- Production deployment and monitoring setup

---

# 12. Glossary

| Term | Definition |
|------|------------|
| MCA | Merchant Cash Advance - Purchase of future receivables at a discount, not a loan |
| Factor Rate | Multiplier applied to funded amount to determine total payback (e.g., 1.35 = $1.35 payback per $1 funded) |
| RTR | Remaining To Receive - Outstanding balance owed on an advance |
| Stacking | Having multiple MCA positions simultaneously, increases default risk |
| UCC-1 | Uniform Commercial Code financing statement establishing security interest in collateral |
| ISO | Independent Sales Organization - Third-party broker/agent who refers MCA deals |
| NSF | Non-Sufficient Funds - Failed payment due to inadequate account balance |
| ACH | Automated Clearing House - Electronic funds transfer network for bank transactions |
| Paper Grade | Risk classification (A/B/C/D) based on creditworthiness and cash flow analysis |
| TIB | Time In Business - Duration the merchant has been operating |
| Holdback | Percentage of daily deposits withheld for MCA repayment (split funding) |
| Clawback | Recovery of broker commission if advance defaults within specified period |
| OCR | Optical Character Recognition - Automated text extraction from documents |
| RBAC | Role-Based Access Control - Permission system based on user roles |

---

# 13. Reference Architecture

This PRD's architecture and patterns are informed by the following open-source projects:

## 13.1 Apache Fineract
**URL**: https://github.com/apache/fineract

Apache Fineract is an open-source core banking platform providing a flexible, extensible foundation for a wide range of financial services. Key patterns adopted include loan entity modeling, transaction processing strategies, external events via message queues, multi-tenant architecture, and comprehensive audit trail implementation.

## 13.2 NextCRM
**URL**: https://github.com/pdovhomilja/nextcrm-app

NextCRM is a modern CRM built on Next.js 15 with TypeScript, shadcn/ui, Prisma, and MongoDB. Key patterns adopted include project structure, authentication flow with Auth.js, document storage with UploadThing/S3, email integration with Resend and React Email, and chart implementation with Tremor.

## 13.3 SaasHQ
**URL**: https://github.com/saashqdev/saashq

SaasHQ is a CRM/ERP starter built on Next.js 14 with PostgreSQL. Key additions beyond NextCRM include workflow engine patterns for automation and PostgreSQL as the preferred database for financial data integrity.

## 13.4 DigiFi Loan Origination System
**URL**: https://github.com/getsan4u/loan-origination-system

DigiFi provides end-to-end lending process management with built-in underwriting, document management, e-signature integration, and rules-based decision processes. Key patterns adopted include decision engine configuration, document workflow management, and fraud detection integration patterns.

## 13.5 Frappe Lending
**URL**: https://github.com/frappe/lending

Frappe Lending is a comprehensive Loan Management System built on ERPNext. Key patterns adopted include loan product configuration templates, collateral tracking, automated accounting entries, and co-lending/loan transfer workflows.

---

*— End of Document —*
