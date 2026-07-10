/**
 * Seed database of well-known scholarships.
 * These are verified real scholarships used to populate the app
 * immediately, before the live scrapers have run.
 */

import type { ScrapedScholarship } from "./types";

const NOW = new Date().toISOString();

export const SEED_SCHOLARSHIPS: ScrapedScholarship[] = [
 // ── National Merit / Academic ─────────────────────────────────────────────
 {
 id: "seed_gates_millennium",
 name: "Gates Scholarship (formerly Gates Millennium Scholars)",
 organization: "Bill & Melinda Gates Foundation",
 amountText: "Full college funding",
 amount: 0,
 deadlineText: "September (annual)",
 description:
 "Provides full college funding for outstanding minority students with financial need. Covers tuition, room, board, and other costs for 4 years at the college of the student's choice.",
 eligibility:
 "U.S. citizen or legal permanent resident. African American, American Indian/Alaska Native, Asian Pacific Islander American, or Hispanic American. Minimum 3.3 GPA. Pell Grant eligible. High school senior.",
 applicationUrl: "https://www.thegatesscholarship.org/",
 source: "seed",
 categories: ["Minority", "Need-Based", "Full Ride", "Undergraduate"],
 tags: ["minority", "full-ride", "need-based", "high-school-senior"],
 prompts: [
 { id: "p1", prompt: "Describe your leadership abilities and experience.", wordLimit: 500, required: true },
 { id: "p2", prompt: "Describe a significant challenge you've faced and how you overcame it.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 3, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_coca_cola",
 name: "Coca-Cola Scholars Program",
 organization: "Coca-Cola Scholars Foundation",
 amountText: "$20,000",
 amount: 20000,
 deadlineText: "October 31 (annual)",
 description:
 "Awards $20,000 to 150 exceptional high school seniors who demonstrate outstanding leadership and service in their communities.",
 eligibility:
 "U.S. citizen or legal permanent resident. Current high school senior. Minimum 3.0 GPA. Attend school in the U.S.",
 applicationUrl: "https://www.coca-colascholarsfoundation.org/",
 source: "seed",
 categories: ["Leadership", "Community Service", "High School", "Merit"],
 tags: ["leadership", "service", "high-school-senior", "merit"],
 prompts: [
 { id: "p1", prompt: "Describe the most significant community service you have done and why it was meaningful to you.", wordLimit: 400, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 2, financialDocuments: false, portfolioRequired: false, interviewRequired: true, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_jack_kent_cooke",
 name: "Jack Kent Cooke Foundation College Scholarship",
 organization: "Jack Kent Cooke Foundation",
 amountText: "Up to $55,000/year",
 amount: 55000,
 deadlineText: "November (annual)",
 description:
 "The largest private undergraduate scholarship in the U.S. awarded to high school seniors with exceptional academic ability and significant financial need.",
 eligibility:
 "High school senior. Minimum 3.5 GPA. Demonstrate significant financial need. Plan to enroll in an accredited 4-year college.",
 applicationUrl: "https://www.jkcf.org/our-scholarships/college-scholarship-program/",
 source: "seed",
 categories: ["Need-Based", "Merit", "Full Ride", "Undergraduate", "High School"],
 tags: ["need-based", "merit", "full-ride", "high-school-senior"],
 prompts: [
 { id: "p1", prompt: "What extracurricular activities or paid/unpaid work have you found most meaningful, and why?", wordLimit: 700, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 3, financialDocuments: true, portfolioRequired: false, interviewRequired: true, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_regeneron_sts",
 name: "Regeneron Science Talent Search",
 organization: "Society for Science",
 amountText: "Up to $250,000",
 amount: 250000,
 deadlineText: "November (annual)",
 description:
 "America's oldest and most prestigious science and math competition for high school seniors. Top 40 finalists travel to Washington, D.C. to compete for prizes.",
 eligibility:
 "High school senior in the U.S. or U.S. territories. Must complete an independent research project in science, technology, engineering, or math.",
 applicationUrl: "https://www.societyforscience.org/regeneron-sts/",
 source: "seed",
 categories: ["STEM", "Research", "High School", "Competition"],
 tags: ["stem", "research", "competition", "science"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 2, financialDocuments: false, portfolioRequired: true, interviewRequired: false, otherDocuments: ["Research paper", "Research essay"] },
 scrapedAt: NOW,
 },
 {
 id: "seed_questbridge",
 name: "QuestBridge National College Match",
 organization: "QuestBridge",
 amountText: "Full 4-year scholarship",
 amount: 0,
 deadlineText: "September (annual)",
 description:
 "Links high-achieving, low-income students with the nation's best colleges. Matched scholars receive a full 4-year scholarship including room and board.",
 eligibility:
 "High school senior. U.S. citizen, permanent resident, or DACA recipient. Household income typically under $65,000. Exceptional academic achievement.",
 applicationUrl: "https://www.questbridge.org/",
 source: "seed",
 categories: ["Need-Based", "Full Ride", "High School", "First Generation"],
 tags: ["need-based", "full-ride", "low-income", "high-school-senior"],
 prompts: [
 { id: "p1", prompt: "Describe your family's economic background and how it has shaped your perspective.", wordLimit: 500, required: true },
 { id: "p2", prompt: "Describe an intellectual passion that has affected your academic career.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 2, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_dell_scholars",
 name: "Dell Scholars Program",
 organization: "Michael & Susan Dell Foundation",
 amountText: "$20,000",
 amount: 20000,
 deadlineText: "December (annual)",
 description:
 "Provides $20,000 over six years plus a laptop and textbook credits to students who demonstrate need and potential to graduate from college.",
 eligibility:
 "U.S. citizen or permanent resident. Enrolled in or accepted to a Title IV accredited college. Minimum 2.4 GPA. Demonstrate financial need. Participated in AVID, College Advising Corps, or similar program.",
 applicationUrl: "https://www.dellscholars.org/",
 source: "seed",
 categories: ["Need-Based", "First Generation", "Undergraduate"],
 tags: ["need-based", "first-generation", "high-school-senior"],
 prompts: [
 { id: "p1", prompt: "Describe the challenges you've faced in pursuing your education and how you've overcome them.", wordLimit: 600, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── STEM / Science ─────────────────────────────────────────────────────────
 {
 id: "seed_society_women_engineers",
 name: "Society of Women Engineers Scholarship",
 organization: "Society of Women Engineers (SWE)",
 amountText: "$1,000, $15,000",
 amount: 15000,
 deadlineText: "February (annual)",
 description:
 "SWE awards millions of dollars in scholarships annually to women pursuing STEM degrees. Multiple scholarship types are available.",
 eligibility:
 "Identify as a woman or non-binary. Enrolled in an ABET-accredited engineering or computer science program. U.S. citizen or permanent resident.",
 applicationUrl: "https://swe.org/scholarships/",
 source: "seed",
 categories: ["Women", "STEM", "Engineering", "Undergraduate", "Graduate"],
 tags: ["women", "stem", "engineering", "undergrad"],
 prompts: [
 { id: "p1", prompt: "Describe your interest in engineering or technology and how it has developed.", wordLimit: 400, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_google_lime",
 name: "Google Lime Scholarship",
 organization: "Google & Lime Connect",
 amountText: "$10,000",
 amount: 10000,
 deadlineText: "December (annual)",
 description:
 "Supports students with disabilities pursuing computer science, computer engineering, or closely related STEM degrees.",
 eligibility:
 "Have a visible or non-visible disability. Enrolled in a 4-year university in the U.S. or Canada. Pursuing a degree in computer science, computer engineering, or related STEM field. Minimum 3.0 GPA.",
 applicationUrl: "https://limeconnect.com/programs/page/google-lime-scholarship",
 source: "seed",
 categories: ["STEM", "Disability", "Computer Science"],
 tags: ["disability", "stem", "computer-science", "google"],
 prompts: [
 { id: "p1", prompt: "Describe the most significant technical project you have worked on.", wordLimit: 600, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_uncf",
 name: "UNCF General Scholarship Fund",
 organization: "United Negro College Fund (UNCF)",
 amountText: "$2,000, $10,000",
 amount: 10000,
 deadlineText: "Rolling",
 description:
 "UNCF offers hundreds of scholarship programs for African American students attending HBCU and other colleges.",
 eligibility:
 "African American student. Enrolled full-time at an accredited 2- or 4-year college. Minimum 2.5 GPA. Demonstrate unmet financial need.",
 applicationUrl: "https://scholarships.uncf.org/",
 source: "seed",
 categories: ["Minority", "African American", "Need-Based", "Undergraduate"],
 tags: ["minority", "african-american", "need-based", "hbcu"],
 prompts: [
 { id: "p1", prompt: "Describe your educational and career goals.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_hispanic_scholarship",
 name: "Hispanic Scholarship Fund",
 organization: "Hispanic Scholarship Fund (HSF)",
 amountText: "$500, $5,000",
 amount: 5000,
 deadlineText: "February (annual)",
 description:
 "Empowers Hispanic American students to succeed in higher education by providing scholarships, access to resources, and support.",
 eligibility:
 "Hispanic heritage. U.S. citizen, permanent resident, or DACA recipient. Enrolled in a full-time undergraduate or graduate program. Minimum 3.0 GPA for undergrad.",
 applicationUrl: "https://www.hsf.net/",
 source: "seed",
 categories: ["Hispanic/Latino", "Minority", "Undergraduate", "Graduate"],
 tags: ["hispanic", "minority", "need-based"],
 prompts: [
 { id: "p1", prompt: "How do you plan to give back to the Hispanic community after completing your education?", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_thurgood_marshall",
 name: "Thurgood Marshall College Fund Scholarship",
 organization: "Thurgood Marshall College Fund",
 amountText: "Up to $6,000",
 amount: 6000,
 deadlineText: "February (annual)",
 description:
 "Supports students attending HBCU member schools with scholarships and career development opportunities.",
 eligibility:
 "Enrolled at an HBCU member school. Minimum 3.0 GPA. Demonstrate financial need.",
 applicationUrl: "https://tmcf.org/our-scholarships/",
 source: "seed",
 categories: ["HBCU", "Minority", "African American", "Need-Based"],
 tags: ["hbcu", "african-american", "minority", "need-based"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 2, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── First Generation / Low Income ─────────────────────────────────────────
 {
 id: "seed_first_gen_foundation",
 name: "First Generation Foundation Scholarship",
 organization: "First Generation Foundation",
 amountText: "$1,000, $4,000",
 amount: 4000,
 deadlineText: "March (annual)",
 description:
 "Supports first-generation college students in completing their degrees with scholarship funding and mentorship.",
 eligibility:
 "First-generation college student (neither parent has a 4-year degree). Enrolled in a 2- or 4-year accredited college. Demonstrate financial need.",
 applicationUrl: "https://www.firstgenfoundation.org/",
 source: "seed",
 categories: ["First Generation", "Need-Based", "Undergraduate"],
 tags: ["first-generation", "need-based"],
 prompts: [
 { id: "p1", prompt: "Describe what being a first-generation student means to you and your family.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_dream_us",
 name: "TheDream.US National Scholarship",
 organization: "TheDream.US",
 amountText: "Up to $33,000",
 amount: 33000,
 deadlineText: "February (annual)",
 description:
 "America's largest scholarship fund for DREAMers, providing funding to undocumented and DACA students to attend college.",
 eligibility:
 "DACA or TPS recipient. Graduated from a U.S. high school. Annual household income under $60,000. Minimum 2.5 GPA. First time attending college.",
 applicationUrl: "https://www.thedream.us/scholarships/national-scholarship/",
 source: "seed",
 categories: ["DACA", "Immigrant", "Need-Based", "Undergraduate"],
 tags: ["daca", "dreamer", "immigrant", "need-based"],
 prompts: [
 { id: "p1", prompt: "Describe your immigration experience and how it has shaped your goals.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Community Service ──────────────────────────────────────────────────────
 {
 id: "seed_prudential_spirit",
 name: "Prudential Spirit of Community Awards",
 organization: "Prudential Financial",
 amountText: "$1,000, $5,000",
 amount: 5000,
 deadlineText: "November (annual)",
 description:
 "Honors middle and high school students who have demonstrated exemplary volunteer service in their communities.",
 eligibility:
 "Student in grades 5 to 12 enrolled in a U.S. school. Must demonstrate outstanding volunteer community service.",
 applicationUrl: "https://spirit.prudential.com/",
 source: "seed",
 categories: ["Community Service", "High School", "Middle School"],
 tags: ["community-service", "volunteer", "high-school"],
 prompts: [
 { id: "p1", prompt: "Describe your most significant volunteer activity and its impact on your community.", wordLimit: 600, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_americorps",
 name: "AmeriCorps Education Award",
 organization: "AmeriCorps",
 amountText: "$4,096.50, $6,895",
 amount: 6895,
 deadlineText: "Rolling",
 description:
 "Earn an education award by completing a term of national service. Can be used to pay student loans or education costs.",
 eligibility:
 "U.S. citizen or national. Minimum age 17 (or 18 for some programs). Complete an approved AmeriCorps service term.",
 applicationUrl: "https://americorps.gov/",
 source: "seed",
 categories: ["Community Service", "Undergraduate", "Graduate"],
 tags: ["community-service", "national-service", "americorps"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: true, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Arts / Creative ────────────────────────────────────────────────────────
 {
 id: "seed_scholastic_art",
 name: "Scholastic Art & Writing Awards",
 organization: "Alliance for Young Artists & Writers",
 amountText: "Up to $10,000",
 amount: 10000,
 deadlineText: "December (annual)",
 description:
 "The nation's longest-running and most prestigious recognition program for creative teens in art and writing. Gold medalists receive scholarships.",
 eligibility:
 "Students in grades 7 to 12 enrolled in U.S. schools. Original artwork or writing in one of 29 categories.",
 applicationUrl: "https://www.artandwriting.org/",
 source: "seed",
 categories: ["Arts", "Writing", "High School", "Competition"],
 tags: ["arts", "writing", "creative", "competition"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: true, interviewRequired: false, otherDocuments: ["Portfolio submission"] },
 scrapedAt: NOW,
 },
 {
 id: "seed_afi_conservatory",
 name: "American Film Institute Conservatory Fellowship",
 organization: "American Film Institute",
 amountText: "Partial to full tuition",
 amount: 0,
 deadlineText: "January (annual)",
 description:
 "Fellowships for students pursuing graduate education in filmmaking at one of the top film schools in the world.",
 eligibility:
 "Graduate student applicants for AFI Conservatory MFA programs. Portfolio review required.",
 applicationUrl: "https://www.afi.com/education/conservatory/",
 source: "seed",
 categories: ["Arts", "Film", "Graduate", "Creative"],
 tags: ["film", "arts", "graduate", "creative"],
 prompts: [],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 2, financialDocuments: false, portfolioRequired: true, interviewRequired: true, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Business / Entrepreneurship ─────────────────────────────────────────
 {
 id: "seed_deca",
 name: "DECA Scholarship Program",
 organization: "DECA Inc.",
 amountText: "$1,000, $3,000",
 amount: 3000,
 deadlineText: "January (annual)",
 description:
 "Multiple scholarships for DECA members who demonstrate excellence in business, marketing, and entrepreneurship.",
 eligibility:
 "Active DECA member. High school senior or current college student. Demonstrate academic achievement and DECA involvement.",
 applicationUrl: "https://www.deca.org/scholarships/",
 source: "seed",
 categories: ["Business", "Leadership", "Entrepreneurship"],
 tags: ["business", "entrepreneurship", "marketing", "leadership"],
 prompts: [
 { id: "p1", prompt: "Describe your leadership experience in DECA or business-related activities.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Healthcare ─────────────────────────────────────────────────────────────
 {
 id: "seed_anf_nursing",
 name: "American Nurses Foundation Scholarship",
 organization: "American Nurses Foundation",
 amountText: "$2,500, $10,000",
 amount: 10000,
 deadlineText: "May (annual)",
 description:
 "Supports students pursuing a nursing degree with a range of scholarships for various specializations and career stages.",
 eligibility:
 "Currently enrolled in an accredited nursing program. Various scholarships have different GPA and enrollment requirements.",
 applicationUrl: "https://www.nursingworld.org/foundation/programs/scholarships/",
 source: "seed",
 categories: ["Healthcare", "Nursing", "Undergraduate", "Graduate"],
 tags: ["nursing", "healthcare", "medical"],
 prompts: [
 { id: "p1", prompt: "Why did you choose nursing as a career and what do you hope to contribute to the field?", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Military / Public Service ──────────────────────────────────────────────
 {
 id: "seed_rotc",
 name: "Army ROTC Scholarship",
 organization: "U.S. Army",
 amountText: "Full tuition + $420/month stipend",
 amount: 0,
 deadlineText: "February (annual)",
 description:
 "Full tuition, fees, books, and a monthly stipend for students who participate in Army ROTC and commit to serve as Army officers.",
 eligibility:
 "U.S. citizen. 17 to 26 years old. Enrolled or accepted at a college with Army ROTC. Minimum 2.5 GPA. Physical fitness requirements.",
 applicationUrl: "https://www.goarmy.com/rotc/scholarships.html",
 source: "seed",
 categories: ["Military", "Full Ride", "Undergraduate"],
 tags: ["military", "army", "service", "full-ride"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: true, otherDocuments: ["Physical fitness test"] },
 scrapedAt: NOW,
 },
 {
 id: "seed_truman",
 name: "Harry S. Truman Scholarship",
 organization: "Harry S. Truman Scholarship Foundation",
 amountText: "$30,000",
 amount: 30000,
 deadlineText: "February (annual)",
 description:
 "For college juniors with outstanding leadership potential who plan to pursue careers in public service.",
 eligibility:
 "U.S. citizen or U.S. national. Junior-year college student. Minimum 3.0 GPA. Plan career in government, nonprofit, or public service.",
 applicationUrl: "https://www.truman.gov/",
 source: "seed",
 categories: ["Public Service", "Leadership", "Undergraduate"],
 tags: ["public-service", "government", "leadership", "junior"],
 prompts: [
 { id: "p1", prompt: "Describe a public policy issue that is important to you and a legislative proposal you would offer to address it.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: true, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Graduate ───────────────────────────────────────────────────────────────
 {
 id: "seed_nsf_grfp",
 name: "NSF Graduate Research Fellowship Program (GRFP)",
 organization: "National Science Foundation",
 amountText: "$37,000/year stipend + $16,000 tuition",
 amount: 37000,
 deadlineText: "October (annual)",
 description:
 "The NSF GRFP recognizes and supports outstanding graduate students pursuing research-based master's and doctoral degrees in STEM fields.",
 eligibility:
 "U.S. citizen, national, or permanent resident. Graduate student (or senior undergrad) in STEM. Early in graduate career (typically first two years).",
 applicationUrl: "https://www.nsfgrfp.org/",
 source: "seed",
 categories: ["STEM", "Research", "Graduate", "Fellowship"],
 tags: ["nsf", "stem", "graduate", "research", "fellowship"],
 prompts: [
 { id: "p1", prompt: "Personal Statement: Describe your personal, educational, and professional development.", wordLimit: 3000, required: true },
 { id: "p2", prompt: "Research Statement: Describe your proposed research and why it is significant.", wordLimit: 3000, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 3, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_fulbright",
 name: "Fulbright U.S. Student Program",
 organization: "U.S. Department of State",
 amountText: "Full funding (grant + living stipend)",
 amount: 0,
 deadlineText: "October (annual)",
 description:
 "Fully funded grants for U.S. citizens to study, conduct research, or teach English abroad for one academic year.",
 eligibility:
 "U.S. citizen. Bachelor's degree by start of grant period. Proposing study, research, or English teaching in a participating country.",
 applicationUrl: "https://us.fulbrightonline.org/",
 source: "seed",
 categories: ["International", "Graduate", "Research", "Full Ride", "Fellowship"],
 tags: ["fulbright", "international", "fellowship", "graduate", "research"],
 prompts: [
 { id: "p1", prompt: "Statement of Grant Purpose: Describe your proposed project.", wordLimit: 1000, required: true },
 { id: "p2", prompt: "Personal Statement: Describe your background and how this grant fits your goals.", wordLimit: 1000, required: true },
 ],
 requirements: { resumeRequired: true, transcriptRequired: true, recommendationLetters: 3, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── No Essay ───────────────────────────────────────────────────────────────
 {
 id: "seed_niche_50k",
 name: "Niche $50,000 No Essay Scholarship",
 organization: "Niche",
 amountText: "$50,000",
 amount: 50000,
 deadlineText: "Monthly drawing",
 description:
 "A monthly no-essay scholarship. Create a free Niche account and complete your profile to enter automatically.",
 eligibility:
 "Open to U.S. high school and college students. No essay required, just a complete Niche profile.",
 applicationUrl: "https://www.niche.com/colleges/scholarship/",
 source: "seed",
 categories: ["No Essay", "High School", "Undergraduate"],
 tags: ["no-essay", "easy", "monthly"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_bold_org",
 name: "Bold.org Monthly Scholarships",
 organization: "Bold.org",
 amountText: "$1,000, $25,000",
 amount: 25000,
 deadlineText: "Monthly",
 description:
 "Bold.org offers dozens of scholarships every month, many with short prompts or no essay requirements. New scholarships added weekly.",
 eligibility:
 "Varies by scholarship. Create a Bold.org profile to see matching opportunities.",
 applicationUrl: "https://bold.org/scholarships/",
 source: "seed",
 categories: ["No Essay", "High School", "Undergraduate", "Graduate"],
 tags: ["no-essay", "easy", "monthly", "diverse"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 {
 id: "seed_scholly",
 name: "Scholly Scholarships",
 organization: "Scholly",
 amountText: "Varies ($500, $25,000)",
 amount: 25000,
 deadlineText: "Rolling",
 description:
 "Curated scholarship matching platform with hundreds of opportunities for students at all levels.",
 eligibility: "Varies by scholarship.",
 applicationUrl: "https://myscholly.com/",
 source: "seed",
 categories: ["High School", "Undergraduate", "Graduate", "Minority"],
 tags: ["platform", "matching", "diverse"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Transfer Students ──────────────────────────────────────────────────────
 {
 id: "seed_phi_theta_kappa",
 name: "Phi Theta Kappa Transfer Scholarship",
 organization: "Phi Theta Kappa Honor Society",
 amountText: "$1,000, $5,000+",
 amount: 5000,
 deadlineText: "Varies by college",
 description:
 "PTK members receive substantial scholarship advantages at hundreds of transfer partner colleges. Over $38 million available annually.",
 eligibility:
 "Member of Phi Theta Kappa Honor Society. Transferring from a 2-year to a 4-year college.",
 applicationUrl: "https://www.ptk.org/scholarships/",
 source: "seed",
 categories: ["Transfer", "Community College", "Academic Merit"],
 tags: ["transfer", "community-college", "phi-theta-kappa"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Athletics ──────────────────────────────────────────────────────────────
 {
 id: "seed_ncaa_div1",
 name: "NCAA Division I Athletic Scholarship",
 organization: "NCAA",
 amountText: "Full or partial tuition",
 amount: 0,
 deadlineText: "Varies by sport and school",
 description:
 "Athletic scholarships offered by NCAA Division I schools cover tuition, room, board, and books for qualifying student athletes.",
 eligibility:
 "Student athlete meeting NCAA eligibility requirements. Must be recruited by a Division I program.",
 applicationUrl: "https://www.ncaa.org/sports/2015/4/20/scholarships.aspx",
 source: "seed",
 categories: ["Athletics", "Undergraduate"],
 tags: ["athletic", "sports", "ncaa", "division-1"],
 prompts: [],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: ["Athletic portfolio/highlights"] },
 scrapedAt: NOW,
 },
 // ── Asian American / Pacific Islander ─────────────────────────────────────
 {
 id: "seed_apala",
 name: "Asian Pacific American Labor Alliance Scholarship",
 organization: "Asian Pacific American Labor Alliance (APALA)",
 amountText: "$1,000",
 amount: 1000,
 deadlineText: "January (annual)",
 description:
 "Supports Asian Pacific American students who demonstrate commitment to the labor movement and to their communities.",
 eligibility:
 "Asian Pacific American student. Accepted or enrolled in a college or university. Demonstrate activism and commitment to labor issues.",
 applicationUrl: "https://www.apalanet.org/scholarships.html",
 source: "seed",
 categories: ["Asian American", "Minority", "Community Service"],
 tags: ["asian-american", "aapi", "minority", "labor"],
 prompts: [
 { id: "p1", prompt: "Describe your commitment to social justice and the labor movement.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 1, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Native American ────────────────────────────────────────────────────────
 {
 id: "seed_american_indian_college",
 name: "American Indian College Fund Scholarship",
 organization: "American Indian College Fund",
 amountText: "$1,000, $8,500",
 amount: 8500,
 deadlineText: "May (annual)",
 description:
 "The nation's largest source of funding for American Indian and Alaska Native higher education, providing thousands of scholarships annually.",
 eligibility:
 "American Indian or Alaska Native student. Enrolled or accepted at a tribal college or other accredited institution. Demonstrate financial need.",
 applicationUrl: "https://collegefund.org/students/scholarships/",
 source: "seed",
 categories: ["Native American", "Minority", "Need-Based", "Undergraduate"],
 tags: ["native-american", "indigenous", "minority", "need-based"],
 prompts: [
 { id: "p1", prompt: "Describe your tribal affiliation and how your heritage has shaped your educational goals.", wordLimit: 500, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: true, recommendationLetters: 0, financialDocuments: true, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
 // ── Entrepreneurship ──────────────────────────────────────────────────────
 {
 id: "seed_young_entrepreneur",
 name: "Young Entrepreneur Foundation Scholarship",
 organization: "NFIB Young Entrepreneur Foundation",
 amountText: "$1,000, $10,000",
 amount: 10000,
 deadlineText: "January (annual)",
 description:
 "Recognizes and rewards high school students who have entrepreneurial spirit and potential for business leadership.",
 eligibility:
 "High school student in the U.S. Demonstrate entrepreneurial spirit through activities, projects, or a business venture.",
 applicationUrl: "https://www.youngentrepreneur.org/scholarships",
 source: "seed",
 categories: ["Entrepreneurship", "Business", "High School"],
 tags: ["entrepreneurship", "business", "high-school"],
 prompts: [
 { id: "p1", prompt: "Describe a business idea you have or an entrepreneurial project you have started.", wordLimit: 600, required: true },
 ],
 requirements: { resumeRequired: false, transcriptRequired: false, recommendationLetters: 0, financialDocuments: false, portfolioRequired: false, interviewRequired: false, otherDocuments: [] },
 scrapedAt: NOW,
 },
];
