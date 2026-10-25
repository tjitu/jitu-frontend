export type HiringDivision =
  | "Technology"
  | "Product & Operations"
  | "Marketing & Growth";

export const HIRING_DIVISIONS: HiringDivision[] = [
  "Technology",
  "Product & Operations",
  "Marketing & Growth",
];

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED";

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; description: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    description: "Application received and queued for review.",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    description: "Our team is reviewing your CV, essays, and proof of work.",
  },
  INTERVIEW: {
    label: "Interview Stage",
    description: "Shortlisted for a 1-on-1 discussion with the JITU team.",
  },
  ACCEPTED: {
    label: "Accepted",
    description: "Welcome to JITU! Check your WhatsApp/email for onboarding.",
  },
  REJECTED: {
    label: "Not Selected",
    description: "Thank you for applying to JITU Open Hiring 2026.",
  },
};

export interface HiringPosition {
  id: string;
  title: string;
  division: HiringDivision;
  slots: number;
  summary: string;
  responsibilities: string[];
  proofOfWorkHint: string;
}

export const HIRING_POSITIONS: HiringPosition[] = [
  {
    id: "associate-software-engineer",
    title: "Associate Software Engineer",
    division: "Technology",
    slots: 1,
    summary:
      "Build and scale JITU's core web platform, high-concurrency exam engine, payment flows, and internal tooling.",
    responsibilities: [
      "Develop responsive, fast interfaces and APIs using Next.js, TypeScript, NestJS, and PostgreSQL.",
      "Ensure reliability during live tryout windows and optimize query/rendering performance.",
      "Take end-to-end ownership of features from technical design to production deployment.",
    ],
    proofOfWorkHint:
      "GitHub profile, live deployed web apps, or repositories you have built.",
  },
  {
    id: "associate-ai-engineer",
    title: "Associate AI Engineer",
    division: "Technology",
    slots: 1,
    summary:
      "Design and deploy AI pipelines for automated SNBT question generation, step-by-step explanations, and IRT scoring analytics.",
    responsibilities: [
      "Build and evaluate LLM workflows for curriculum-aligned question & solution synthesis.",
      "Develop psychometric Item Response Theory (IRT) calibration and student diagnostic models.",
      "Optimize prompt reliability, structured outputs, latency, and token cost efficiency.",
    ],
    proofOfWorkHint:
      "GitHub repos, AI/ML notebooks, LLM apps, or technical write-ups.",
  },
  {
    id: "product-management-staff",
    title: "Product Management Staff",
    division: "Product & Operations",
    slots: 1,
    summary:
      "Translate student pain points and business goals into sharp product specs, roadmaps, and measurable user outcomes.",
    responsibilities: [
      "Conduct user interviews with high school students and analyze tryout completion & conversion funnels.",
      "Write clear PRDs, coordinate execution across engineering and design, and manage release cycles.",
      "Own product quality, subtest content readiness, and post-launch metric tracking.",
    ],
    proofOfWorkHint:
      "Product case studies, PRDs, Notion docs, or past projects you managed.",
  },
  {
    id: "business-operations-staff",
    title: "Business Operations Staff",
    division: "Product & Operations",
    slots: 1,
    summary:
      "Run the operational backbone of JITU—from financial tracking and payment reconciliation to partnerships and execution systems.",
    responsibilities: [
      "Manage daily operations, transaction reconciliation, and internal SOP documentation.",
      "Coordinate cross-functional timelines, vendor/partner agreements, and revenue reporting.",
      "Structure scalable processes that turn raw team effort into sustainable unit economics.",
    ],
    proofOfWorkHint:
      "Operations trackers, business decks, financial/event management portfolios, or LinkedIn.",
  },
  {
    id: "marketing-growth-staff",
    title: "Marketing & Growth Staff",
    division: "Marketing & Growth",
    slots: 1,
    summary:
      "Drive student acquisition, viral loops, and conversion from free weekly tryout participants into paying coin users.",
    responsibilities: [
      "Plan and execute organic & performance campaigns across TikTok, Instagram, X, and student channels.",
      "Write sharp, peer-level copywriting and analyze funnel conversion metrics.",
      "Run growth experiments to lower acquisition cost and increase weekly active test-takers.",
    ],
    proofOfWorkHint:
      "Social media accounts grown, campaign results, content samples, or marketing decks.",
  },
  {
    id: "visual-communication-product-designer",
    title: "Visual Communication & Product Designer",
    division: "Marketing & Growth",
    slots: 2,
    summary:
      "Shape JITU's Neo-Brutalist visual identity, 16-bit pixel art assets, social media visuals, and student-facing UI/UX.",
    responsibilities: [
      "Design high-contrast marketing visuals, campaign assets, and cohesive brand communication.",
      "Craft clean, mobile-first product interfaces in Figma adhering to JITU's design system.",
      "Create distinctive visual storytelling that stands out in Indonesia's EdTech landscape.",
    ],
    proofOfWorkHint:
      "Figma links, Behance, Dribbble, Instagram portfolio, or PDF design showcase.",
  },
  {
    id: "community-partnership-staff",
    title: "Community & Partnership Staff",
    division: "Marketing & Growth",
    slots: 1,
    summary:
      "Build JITU's grassroots presence across high schools (SMA/SMK), student organizations, and educational partners.",
    responsibilities: [
      "Establish partnerships with OSIS, school clubs, counseling teachers (BK), and tryout partners.",
      "Manage the student community, school ambassador programs, and referral networks.",
      "Organize collaborative tryout waves and gather direct feedback from students on the ground.",
    ],
    proofOfWorkHint:
      "Partnership proposals, sponsorship/community track records, event portfolios, or LinkedIn.",
  },
];

export interface HiringApplication {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  university: string;
  major: string;
  academicStatus: string;
  domicile: string;
  primaryRole: string;
  primaryDivision: HiringDivision;
  secondaryRole: string;
  availability: string;
  startDate: string;
  cvUrl: string;
  cvFileName?: string;
  portfolioUrl: string;
  linkedinUrl: string;
  experienceEssay: string;
  motivationEssay: string;
  referralSource: string;
  commitmentAgreed: boolean;
  status: ApplicationStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
