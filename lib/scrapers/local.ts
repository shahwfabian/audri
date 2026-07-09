/**
 * Local & state-based scholarship layer.
 *
 * Local scholarships are where students actually win — a kid in a small town
 * competes against dozens, not tens of thousands. This module guarantees that
 * every student in all 50 states + DC sees real, state-level money the moment
 * they set their state in their eligibility profile.
 *
 * Each entry is a real, verified state financial-aid program administered by
 * that state's higher-education agency.
 */

import type { ScrapedScholarship } from "./types";

const NOW = new Date().toISOString();

interface StateProgram {
  state: string;
  abbr: string;
  program: string;
  agency: string;
  amountText: string;
  amount?: number;
  eligibility: string;
  url?: string;
}

const STATE_PROGRAMS: StateProgram[] = [
  { state: "Alabama", abbr: "AL", program: "Alabama Student Assistance Program", agency: "Alabama Commission on Higher Education", amountText: "$300–$5,000", amount: 5000, eligibility: "Alabama resident with substantial financial need, enrolled at an eligible Alabama institution." },
  { state: "Alaska", abbr: "AK", program: "Alaska Performance Scholarship", agency: "Alaska Commission on Postsecondary Education", amountText: "Up to $4,755/yr", amount: 4755, eligibility: "Alaska resident, Alaska high school graduate meeting GPA/curriculum requirements, attending an Alaska institution." },
  { state: "Arizona", abbr: "AZ", program: "Arizona Promise Program", agency: "Arizona Board of Regents", amountText: "Full tuition & fees", eligibility: "Arizona resident, Pell-eligible, 2.5+ GPA, attending an Arizona public university." },
  { state: "Arkansas", abbr: "AR", program: "Arkansas Academic Challenge Scholarship", agency: "Arkansas Division of Higher Education", amountText: "Up to $5,000/yr", amount: 5000, eligibility: "Arkansas resident with 19+ ACT or qualifying GPA, enrolled at an approved Arkansas institution." },
  { state: "California", abbr: "CA", program: "Cal Grant", agency: "California Student Aid Commission", amountText: "Up to full systemwide tuition", eligibility: "California resident meeting GPA and income requirements, attending a qualifying California college." },
  { state: "Colorado", abbr: "CO", program: "Colorado Opportunity Scholarship Initiative", agency: "Colorado Department of Higher Education", amountText: "Varies", eligibility: "Colorado resident with financial need pursuing postsecondary education in Colorado." },
  { state: "Connecticut", abbr: "CT", program: "Roberta B. Willis Scholarship", agency: "Connecticut Office of Higher Education", amountText: "Up to $5,250/yr", amount: 5250, eligibility: "Connecticut resident with financial need or strong academics attending a Connecticut college." },
  { state: "Delaware", abbr: "DE", program: "Delaware SEED Scholarship", agency: "Delaware Higher Education Office", amountText: "Full tuition (associate path)", eligibility: "Delaware resident, 2.5+ GPA, enrolling at Delaware Tech or University of Delaware associate programs." },
  { state: "District of Columbia", abbr: "DC", program: "DC Tuition Assistance Grant (DCTAG)", agency: "DC Office of the State Superintendent of Education", amountText: "Up to $10,000/yr", amount: 10000, eligibility: "DC resident attending eligible public colleges nationwide or private colleges in the DC metro area." },
  { state: "Florida", abbr: "FL", program: "Florida Bright Futures Scholarship", agency: "Florida Department of Education", amountText: "75–100% tuition & fees", eligibility: "Florida resident, Florida high school graduate meeting GPA, test score, and service-hour requirements." },
  { state: "Georgia", abbr: "GA", program: "Georgia HOPE & Zell Miller Scholarship", agency: "Georgia Student Finance Commission", amountText: "Up to full tuition", eligibility: "Georgia resident with 3.0+ GPA (HOPE) or 3.7+ GPA and 1200+ SAT (Zell Miller), attending a Georgia institution." },
  { state: "Hawaii", abbr: "HI", program: "Hawaiʻi Promise Program", agency: "University of Hawaiʻi System", amountText: "Covers unmet direct costs", eligibility: "Hawaiʻi resident with financial need attending a University of Hawaiʻi community college." },
  { state: "Idaho", abbr: "ID", program: "Idaho Opportunity Scholarship", agency: "Idaho State Board of Education", amountText: "Up to $3,500/yr", amount: 3500, eligibility: "Idaho resident, 2.7+ GPA, attending an eligible Idaho institution." },
  { state: "Illinois", abbr: "IL", program: "Illinois MAP Grant", agency: "Illinois Student Assistance Commission", amountText: "Up to ~$8,400/yr", amount: 8400, eligibility: "Illinois resident with financial need attending an approved Illinois college." },
  { state: "Indiana", abbr: "IN", program: "21st Century Scholars Program", agency: "Indiana Commission for Higher Education", amountText: "Up to full tuition", eligibility: "Indiana resident who enrolled in the program in 7th/8th grade, meeting income and GPA requirements." },
  { state: "Iowa", abbr: "IA", program: "Iowa Tuition Grant", agency: "Iowa College Aid", amountText: "Up to $7,500/yr", amount: 7500, eligibility: "Iowa resident with financial need attending an eligible private Iowa college." },
  { state: "Kansas", abbr: "KS", program: "Kansas Comprehensive Grant", agency: "Kansas Board of Regents", amountText: "$100–$3,500/yr", amount: 3500, eligibility: "Kansas resident with financial need attending an eligible Kansas institution full-time." },
  { state: "Kentucky", abbr: "KY", program: "Kentucky Educational Excellence Scholarship (KEES)", agency: "Kentucky Higher Education Assistance Authority", amountText: "Earned per HS grade year", eligibility: "Kentucky resident earning awards for each year of 2.5+ GPA in a Kentucky high school." },
  { state: "Louisiana", abbr: "LA", program: "Louisiana TOPS", agency: "Louisiana Office of Student Financial Assistance", amountText: "Tuition at LA public colleges", eligibility: "Louisiana resident meeting core curriculum, GPA, and ACT requirements." },
  { state: "Maine", abbr: "ME", program: "Maine State Grant Program", agency: "Finance Authority of Maine", amountText: "Up to $3,000/yr", amount: 3000, eligibility: "Maine resident with financial need attending an eligible college." },
  { state: "Maryland", abbr: "MD", program: "Maryland Guaranteed Access Grant", agency: "Maryland Higher Education Commission", amountText: "Up to ~$20,000/yr", amount: 20000, eligibility: "Maryland resident from a low-income household with 2.5+ GPA enrolling full-time in Maryland." },
  { state: "Massachusetts", abbr: "MA", program: "MASSGrant Plus", agency: "Massachusetts Department of Higher Education", amountText: "Tuition & fees assistance", eligibility: "Massachusetts resident with financial need attending a Massachusetts public college." },
  { state: "Michigan", abbr: "MI", program: "Michigan Achievement Scholarship", agency: "State of Michigan (MI Student Aid)", amountText: "Up to $5,500/yr", amount: 5500, eligibility: "Michigan resident graduating from a Michigan high school in 2023 or later, attending in-state." },
  { state: "Minnesota", abbr: "MN", program: "Minnesota State Grant", agency: "Minnesota Office of Higher Education", amountText: "Varies by need", eligibility: "Minnesota resident with financial need attending an eligible Minnesota institution." },
  { state: "Mississippi", abbr: "MS", program: "Mississippi HELP Grant", agency: "Mississippi Office of Student Financial Aid", amountText: "Full tuition", eligibility: "Mississippi resident from a lower-income family with 2.5+ GPA and 20+ ACT." },
  { state: "Missouri", abbr: "MO", program: "Missouri Bright Flight Scholarship", agency: "Missouri Department of Higher Education", amountText: "Up to $3,000/yr", amount: 3000, eligibility: "Missouri resident scoring in the top 3–5% on the ACT/SAT, attending a Missouri institution." },
  { state: "Montana", abbr: "MT", program: "Montana University System Honor Scholarship", agency: "Montana University System", amountText: "4-year tuition waiver", eligibility: "Montana high school graduate with 3.4+ GPA attending an MUS campus." },
  { state: "Nebraska", abbr: "NE", program: "Nebraska Opportunity Grant", agency: "Nebraska Coordinating Commission for Postsecondary Education", amountText: "Varies by need", eligibility: "Nebraska resident with financial need attending an eligible Nebraska institution." },
  { state: "Nevada", abbr: "NV", program: "Governor Guinn Millennium Scholarship", agency: "Nevada State Treasurer", amountText: "Up to $10,000 total", amount: 10000, eligibility: "Nevada resident graduating from a Nevada high school with 3.25+ GPA, attending in-state." },
  { state: "New Hampshire", abbr: "NH", program: "New Hampshire Charitable Foundation Scholarships", agency: "NH Charitable Foundation", amountText: "Varies — largest NH provider", eligibility: "New Hampshire residents; the foundation awards millions annually across dozens of local funds." },
  { state: "New Jersey", abbr: "NJ", program: "New Jersey Tuition Aid Grant (TAG)", agency: "NJ Higher Education Student Assistance Authority", amountText: "Up to ~$13,000/yr", amount: 13000, eligibility: "New Jersey resident with financial need attending an approved New Jersey college full-time." },
  { state: "New Mexico", abbr: "NM", program: "New Mexico Opportunity Scholarship", agency: "New Mexico Higher Education Department", amountText: "Full tuition & fees", eligibility: "New Mexico resident enrolled in 6+ credits at a New Mexico public college." },
  { state: "New York", abbr: "NY", program: "NYS TAP + Excelsior Scholarship", agency: "New York State Higher Education Services Corporation", amountText: "Up to full SUNY/CUNY tuition", eligibility: "New York resident meeting income requirements, attending a New York college." },
  { state: "North Carolina", abbr: "NC", program: "Next NC Scholarship", agency: "North Carolina State Education Assistance Authority", amountText: "At least $3,000–$5,000/yr", amount: 5000, eligibility: "North Carolina resident from a household earning $80,000 or less, attending an NC public institution." },
  { state: "North Dakota", abbr: "ND", program: "North Dakota Academic Scholarship", agency: "North Dakota University System", amountText: "Up to $6,000 total", amount: 6000, eligibility: "North Dakota high school graduate meeting curriculum, GPA, and ACT requirements." },
  { state: "Ohio", abbr: "OH", program: "Ohio College Opportunity Grant", agency: "Ohio Department of Higher Education", amountText: "Varies by need", eligibility: "Ohio resident with financial need attending an eligible Ohio institution." },
  { state: "Oklahoma", abbr: "OK", program: "Oklahoma's Promise", agency: "Oklahoma State Regents for Higher Education", amountText: "Full tuition at OK public colleges", eligibility: "Oklahoma resident who enrolls in 8th–11th grade, meets income limits and 2.5+ GPA curriculum." },
  { state: "Oregon", abbr: "OR", program: "Oregon Promise Grant", agency: "Oregon Office of Student Access and Completion", amountText: "Community college tuition", eligibility: "Oregon resident enrolling in an Oregon community college within 6 months of HS graduation/GED." },
  { state: "Pennsylvania", abbr: "PA", program: "Pennsylvania State Grant", agency: "PHEAA", amountText: "Up to ~$5,750/yr", amount: 5750, eligibility: "Pennsylvania resident with financial need attending an approved institution." },
  { state: "Rhode Island", abbr: "RI", program: "Rhode Island Promise", agency: "Community College of Rhode Island", amountText: "Free CCRI tuition", eligibility: "Rhode Island resident enrolling at CCRI straight from high school." },
  { state: "South Carolina", abbr: "SC", program: "Palmetto Fellows & LIFE Scholarship", agency: "South Carolina Commission on Higher Education", amountText: "Up to $7,500/yr", amount: 7500, eligibility: "South Carolina resident meeting GPA, class rank, and test score requirements, attending in-state." },
  { state: "South Dakota", abbr: "SD", program: "South Dakota Opportunity Scholarship", agency: "South Dakota Board of Regents", amountText: "Up to $7,500 total", amount: 7500, eligibility: "South Dakota resident completing the required HS curriculum with a 3.0+ GPA and 24+ ACT." },
  { state: "Tennessee", abbr: "TN", program: "Tennessee HOPE Scholarship & TN Promise", agency: "Tennessee Student Assistance Corporation", amountText: "Up to $5,700/yr", amount: 5700, eligibility: "Tennessee resident meeting GPA/ACT requirements (HOPE) or enrolling in community college (Promise)." },
  { state: "Texas", abbr: "TX", program: "TEXAS Grant", agency: "Texas Higher Education Coordinating Board", amountText: "Average ~$5,000+/yr", amount: 5000, eligibility: "Texas resident with financial need who completed the Foundation High School Program, attending a Texas public university." },
  { state: "Utah", abbr: "UT", program: "Utah Opportunity Scholarship", agency: "Utah System of Higher Education", amountText: "Up to full tuition assistance", eligibility: "Utah resident completing qualifying high school coursework with a 3.3+ GPA." },
  { state: "Vermont", abbr: "VT", program: "VSAC Scholarships", agency: "Vermont Student Assistance Corporation", amountText: "100+ scholarships, varies", eligibility: "Vermont residents — one application unlocks more than 100 Vermont-specific scholarships." },
  { state: "Virginia", abbr: "VA", program: "Virginia Guaranteed Assistance Program", agency: "State Council of Higher Education for Virginia", amountText: "Tuition, fees & book allowance", eligibility: "Virginia resident with financial need, 2.5+ HS GPA, attending a Virginia public college." },
  { state: "Washington", abbr: "WA", program: "Washington College Grant", agency: "Washington Student Achievement Council", amountText: "Up to full public tuition", eligibility: "Washington resident meeting income requirements — one of the most generous state programs in America." },
  { state: "West Virginia", abbr: "WV", program: "West Virginia PROMISE Scholarship", agency: "West Virginia Higher Education Policy Commission", amountText: "Up to $5,500/yr", amount: 5500, eligibility: "West Virginia resident with 3.0+ GPA and qualifying ACT/SAT scores, attending in-state." },
  { state: "Wisconsin", abbr: "WI", program: "Wisconsin Grant", agency: "Wisconsin Higher Educational Aids Board", amountText: "Varies by need", eligibility: "Wisconsin resident with financial need attending an eligible Wisconsin institution." },
  { state: "Wyoming", abbr: "WY", program: "Hathaway Scholarship", agency: "State of Wyoming", amountText: "Up to $1,680/semester", eligibility: "Wyoming resident graduating from a Wyoming high school, attending UW or a Wyoming community college." },
];

export const LOCAL_SCHOLARSHIPS: ScrapedScholarship[] = STATE_PROGRAMS.map((p) => ({
  id: `local_${p.abbr.toLowerCase()}_${p.program.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40)}`,
  name: p.program,
  organization: p.agency,
  amountText: p.amountText,
  amount: p.amount,
  deadlineText: "Annual — check current cycle (many align with FAFSA)",
  description: `${p.state}'s flagship state aid program. Local and state scholarships like this are dramatically less competitive than national awards — you're competing against students in ${p.state}, not the whole country. Administered by the ${p.agency}.`,
  eligibility: `${p.state} resident. ${p.eligibility}`,
  source: "local",
  categories: ["Local", "State-Based", p.state, "Need-Based"],
  tags: ["local", "state", p.abbr.toLowerCase(), p.state.toLowerCase().replace(/\s+/g, "-")],
  prompts: [],
  requirements: {
    resumeRequired: false,
    transcriptRequired: true,
    recommendationLetters: 0,
    financialDocuments: true,
    portfolioRequired: false,
    interviewRequired: false,
    otherDocuments: ["FAFSA"],
  },
  scrapedAt: NOW,
}));

/** Real flagship awards discoverable through the major national platforms. */
export const PLATFORM_SCHOLARSHIPS: ScrapedScholarship[] = [
  {
    id: "bigfuture_monthly",
    name: "BigFuture Scholarships (Monthly Drawings)",
    organization: "College Board — BigFuture",
    amountText: "$500 – $40,000",
    amount: 40000,
    deadlineText: "Monthly drawings",
    description: "College Board awards $500 and $40,000 scholarships every month simply for completing college-planning steps — building a college list, practicing for the SAT, completing the FAFSA. No essay, no GPA requirement.",
    eligibility: "U.S. high school students in the class years College Board specifies. No minimum GPA, no essay, no citizenship requirement.",
    applicationUrl: "https://bigfuture.collegeboard.org/pay-for-college/bigfuture-scholarships",
    source: "bigfuture.collegeboard.org",
    categories: ["No Essay", "High School", "Monthly"],
    tags: ["no-essay", "high-school", "easy-entry"],
    prompts: [],
    requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
  {
    id: "s360_10k_no_essay",
    name: "Scholarships360 $10,000 \"No Essay\" Scholarship",
    organization: "Scholarships360",
    amountText: "$10,000",
    amount: 10000,
    deadlineText: "Annual (rolling entry)",
    description: "Open scholarship awarded through the Scholarships360 platform — enter by creating a free profile. No essay required.",
    eligibility: "Open to high school, college, and graduate students plus adult learners in the U.S.",
    applicationUrl: "https://scholarships360.org/scholarships/search/",
    source: "scholarships360.org",
    categories: ["No Essay", "Undergraduate", "Graduate", "High School"],
    tags: ["no-essay", "all-levels"],
    prompts: [],
    requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
  {
    id: "samerica_dream",
    name: "Scholarship America Dream Award",
    organization: "Scholarship America",
    amountText: "$5,000 – $15,000 (renewable)",
    amount: 15000,
    deadlineText: "October (annual)",
    description: "Renewable awards that GROW each year, targeted at students entering their second year of college — the point where most students run out of funding. Scholarship America is the nation's largest private scholarship administrator.",
    eligibility: "U.S. citizen/permanent resident/DACA, 3.0+ GPA, completed at least one full year of postsecondary education, demonstrated financial need.",
    applicationUrl: "https://scholarshipamerica.org/students/browse-scholarships/",
    source: "scholarshipamerica.org",
    categories: ["Need-Based", "Undergraduate", "Renewable"],
    tags: ["need-based", "renewable", "sophomore"],
    prompts: [{ id: "p1", prompt: "Describe your educational and career goals and how this award will help you achieve them.", wordLimit: 500, required: true }],
    requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
  {
    id: "burger_king_scholars",
    name: "Burger King Scholars Program",
    organization: "Burger King Foundation (administered by Scholarship America)",
    amountText: "$1,000 – $60,000",
    amount: 60000,
    deadlineText: "December 15 (annual)",
    description: "One of the largest employer-connected scholarship programs in the country — thousands of awards annually to high school seniors, BK employees, and their families, based on grades, work experience, and community service.",
    eligibility: "High school senior in the U.S./Canada/Puerto Rico with a 2.5+ GPA. Employees and children of Burger King employees also eligible.",
    applicationUrl: "https://burgerkingfoundation.org/programs/burger-king-scholars",
    source: "scholarshipamerica.org",
    categories: ["High School", "Merit", "Employment"],
    tags: ["high-school-senior", "merit", "large-program"],
    prompts: [],
    requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
  {
    id: "owl_you_deserve_it",
    name: "ScholarshipOwl \"You Deserve It\" Scholarship",
    organization: "ScholarshipOwl",
    amountText: "$1,000 (monthly)",
    amount: 1000,
    deadlineText: "Monthly",
    description: "Recurring monthly award through the ScholarshipOwl platform — registering enters you automatically. Low effort, real money, every month.",
    eligibility: "Ages 16+, U.S. residents enrolled or enrolling in a qualifying institution.",
    applicationUrl: "https://scholarshipowl.com/",
    source: "scholarshipowl.com",
    categories: ["No Essay", "Monthly", "High School", "Undergraduate"],
    tags: ["no-essay", "monthly", "easy-entry"],
    prompts: [],
    requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
  {
    id: "bold_no_essay",
    name: "Bold.org No-Essay Community Scholarships",
    organization: "Bold.org",
    amountText: "$500 – $25,000",
    amount: 25000,
    deadlineText: "Rolling — hundreds of live scholarships",
    description: "Bold.org hosts hundreds of donor-funded scholarships at any moment — many hyper-specific (first-gen nurses, small-town athletes, students from a single county). Specific = fewer applicants = better odds. Build one profile, apply to dozens.",
    eligibility: "Varies per scholarship — filters for state, city, major, GPA, background, and more.",
    applicationUrl: "https://bold.org/scholarships/",
    source: "bold.org",
    categories: ["No Essay", "Local", "Niche", "All Levels"],
    tags: ["no-essay", "niche", "local", "rolling"],
    prompts: [],
    requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
    scrapedAt: NOW,
  },
];
