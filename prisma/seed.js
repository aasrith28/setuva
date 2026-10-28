const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with verified government schemes and accounts...");

  const adminHash = await bcrypt.hash("ApplyRightAdmin2026!", 12);
  const publisherHash = await bcrypt.hash("PublisherSecure2026!", 12);
  const reviewerHash = await bcrypt.hash("ReviewerSecure2026!", 12);
  const studentHash = await bcrypt.hash("StudentKarnataka2026!", 12);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@applyright.org" },
    update: {},
    create: {
      email: "admin@applyright.org",
      passwordHash: adminHash,
      name: "Admin Officer",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "publisher@applyright.org" },
    update: {},
    create: {
      email: "publisher@applyright.org",
      passwordHash: publisherHash,
      name: "Publications Officer",
      role: "publisher",
    },
  });

  await prisma.user.upsert({
    where: { email: "reviewer@applyright.org" },
    update: {},
    create: {
      email: "reviewer@applyright.org",
      passwordHash: reviewerHash,
      name: "Source Verification Reviewer",
      role: "content_reviewer",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@applyright.org" },
    update: {},
    create: {
      email: "student@applyright.org",
      passwordHash: studentHash,
      name: "Aravind Kumar",
      role: "user",
    },
  });

  // 2. Seed Scheme 1: SSP Post-Matric Scholarship
  const ssp = await prisma.service.upsert({
    where: { slug: "ssp-postmatric-scst" },
    update: {},
    create: {
      slug: "ssp-postmatric-scst",
      name: "State Scholarship Portal (SSP) Post-Matric Scholarship",
      category: "Scholarships",
      jurisdiction: "Karnataka",
      description:
        "Comprehensive financial assistance for post-matriculation, undergraduate, and professional students belonging to SC/ST and backward classes in Karnataka.",
      officialApplicationUrl: "https://ssp.postmatric.karnataka.gov.in/",
      status: "verified",
      currentVersion: "1.0.0",
      rules: {
        create: [
          {
            field: "state",
            operator: "equals",
            expectedValue: "Karnataka",
            explanation: "Applicant must be a permanent resident of Karnataka.",
            isMandatory: true,
          },
          {
            field: "category",
            operator: "in",
            expectedValue: "sc,st,obc",
            explanation: "Applicant must belong to eligible designated categories (SC/ST/OBC).",
            isMandatory: true,
          },
          {
            field: "annualFamilyIncome",
            operator: "lte",
            expectedValue: "250000",
            explanation: "Annual family gross income must not exceed ₹2,50,000.",
            isMandatory: true,
          },
          {
            field: "educationLevel",
            operator: "in",
            expectedValue: "postmatric,undergraduate,postgraduate,diploma",
            explanation: "Must be enrolled in an accredited post-matric or higher education degree.",
            isMandatory: true,
          },
        ],
      },
      documents: {
        create: [
          {
            name: "Caste Certificate (RD Number)",
            isMandatory: true,
            guidance: "Must contain valid 15-digit Revenue Department RD number from Nadakacheri portal.",
          },
          {
            name: "Income Certificate (RD Number)",
            isMandatory: true,
            guidance: "Current year income certificate issued by the competent Karnataka revenue authority.",
          },
          {
            name: "College Admission & Fee Receipt",
            isMandatory: true,
            guidance: "Official fee payment receipt issued by an AISHE/Karnataka recognized institution.",
          },
          {
            name: "SSLC / 10th Marks Card",
            isMandatory: true,
            guidance: "Marks statement used for date-of-birth and student identification verification.",
          },
          {
            name: "Aadhaar Seeded Bank Account Confirmation",
            isMandatory: true,
            guidance: "Active bank savings account linked to Aadhaar for Direct Benefit Transfer (DBT).",
          },
        ],
      },
      sources: {
        create: [
          {
            url: "https://ssp.postmatric.karnataka.gov.in/",
            issuingAuthority: "Social Welfare Department, Government of Karnataka",
            sourceType: "portal",
            verificationStatus: "verified",
            excerpt:
              "State Scholarship Portal (SSP) post-matric scholarship provides tuition and maintenance allowances to eligible Karnataka residents with annual family income up to ₹2.5 Lakh. Applications must be routed via SATS student ID.",
          },
        ],
      },
    },
  });

  // 3. Seed Scheme 2: Vidyasiri (Food & Accommodation Assistance)
  const vidyasiri = await prisma.service.upsert({
    where: { slug: "vidyasiri-epass-karnataka" },
    update: {},
    create: {
      slug: "vidyasiri-epass-karnataka",
      name: "Vidyasiri Food and Accommodation Scheme (ePASS)",
      category: "Student Welfare",
      jurisdiction: "Karnataka",
      description:
        "Financial support of ₹1,500/month for food and accommodation to meritorious post-matric students who could not get admission into government post-matric hostels.",
      officialApplicationUrl: "https://karepass.cgg.gov.in/",
      status: "verified",
      currentVersion: "1.0.0",
      rules: {
        create: [
          {
            field: "state",
            operator: "equals",
            expectedValue: "Karnataka",
            explanation: "Applicant must be a permanent resident of Karnataka.",
            isMandatory: true,
          },
          {
            field: "inGovernmentHostel",
            operator: "boolean",
            expectedValue: "false",
            explanation: "Applicant must not currently reside in a free government-run hostel.",
            isMandatory: true,
          },
          {
            field: "distanceFromCollegeKm",
            operator: "gte",
            expectedValue: "5",
            explanation: "College must be at least 5 kilometers away from permanent residence.",
            isMandatory: true,
          },
          {
            field: "annualFamilyIncome",
            operator: "lte",
            expectedValue: "200000",
            explanation: "Family income must be ₹2,00,000 or below.",
            isMandatory: true,
          },
        ],
      },
      documents: {
        create: [
          {
            name: "Study Certificate from College Principal",
            isMandatory: true,
            guidance: "Certifying non-hosteller status and distance from registered residence.",
          },
          {
            name: "Previous Year Examination Marks Card",
            isMandatory: true,
            guidance: "Must have passed preceding year exam with minimum 50% marks.",
          },
          {
            name: "Aadhaar DBT-Enabled Bank Account",
            isMandatory: true,
            guidance: "National Payment Corporation of India (NPCI) mapped bank account.",
          },
        ],
      },
      sources: {
        create: [
          {
            url: "https://karepass.cgg.gov.in/",
            issuingAuthority: "Backward Classes Welfare Department, Govt of Karnataka",
            sourceType: "portal",
            verificationStatus: "verified",
            excerpt:
              "Under Vidyasiri, stipend of ₹1,500 per month for 10 months is provided to eligible students pursuing higher education who reside outside government hostels. Minimum 75% attendance required.",
          },
        ],
      },
    },
  });

  // 4. Seed Scheme 3: Yuva Nidhi Scheme
  const yuvaNidhi = await prisma.service.upsert({
    where: { slug: "yuva-nidhi-karnataka" },
    update: {},
    create: {
      slug: "yuva-nidhi-karnataka",
      name: "Yuva Nidhi Scheme (Unemployment Allowance)",
      category: "Youth Employment",
      jurisdiction: "Karnataka",
      description:
        "Financial unemployment allowance of ₹3,000/month for degree holders and ₹1,500/month for diploma holders for up to 2 years.",
      officialApplicationUrl: "https://sevasindhu.karnataka.gov.in/",
      status: "verified",
      currentVersion: "1.0.0",
      rules: {
        create: [
          {
            field: "state",
            operator: "equals",
            expectedValue: "Karnataka",
            explanation: "Must be a Karnataka resident having studied at least 6 years in Karnataka.",
            isMandatory: true,
          },
          {
            field: "currentlyEmployed",
            operator: "boolean",
            expectedValue: "false",
            explanation: "Applicant must not be employed in government or private sector.",
            isMandatory: true,
          },
          {
            field: "higherStudies",
            operator: "boolean",
            expectedValue: "false",
            explanation: "Applicant must not be currently enrolled in full-time higher studies.",
            isMandatory: true,
          },
        ],
      },
      documents: {
        create: [
          {
            name: "Degree or Diploma Certificate",
            isMandatory: true,
            guidance: "Final degree certificate or provisional certificate with passing year.",
          },
          {
            name: "Karnataka Domicile / Study Certificate",
            isMandatory: true,
            guidance: "Proving at least 6 years of education completed within Karnataka.",
          },
          {
            name: "Self-Declaration of Unemployment",
            isMandatory: true,
            guidance: "Online self-declaration through Seva Sindhu portal.",
          },
        ],
      },
      sources: {
        create: [
          {
            url: "https://sevasindhu.karnataka.gov.in/",
            issuingAuthority: "Skill Development, Entrepreneurship and Livelihood Dept, Govt of Karnataka",
            sourceType: "portal",
            verificationStatus: "verified",
            excerpt:
              "Yuva Nidhi provides ₹3,000 monthly for graduates and ₹1,500 for diploma holders who graduated in 2023 or later and remain unemployed 180 days after graduation.",
          },
        ],
      },
    },
  });

  // Seed sample tracker for student user
  await prisma.applicationTracker.upsert({
    where: {
      userId_serviceId: {
        userId: student.id,
        serviceId: ssp.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      serviceId: ssp.id,
      status: "in_progress",
      notes: "Awaiting RD number verification for income certificate.",
      checklist: {
        create: [
          {
            title: "Confirm Official Eligibility Criteria",
            isRequired: true,
            isCompleted: true,
          },
          {
            title: "Prepare: Caste Certificate (RD Number)",
            isRequired: true,
            isCompleted: true,
            note: "Verified RD0038291485",
          },
          {
            title: "Prepare: Income Certificate (RD Number)",
            isRequired: true,
            isCompleted: false,
            note: "Applied on Nadakacheri portal",
          },
          {
            title: "Prepare: College Admission & Fee Receipt",
            isRequired: true,
            isCompleted: true,
          },
          {
            title: "Submit Application on Official Government Portal",
            isRequired: true,
            isCompleted: false,
          },
        ],
      },
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
