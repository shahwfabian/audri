// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "PARENT" | "COUNSELOR" | "ADMIN";

export interface User {
 id: string;
 email: string;
 name: string;
 role: UserRole;
 createdAt: string;
 /** Billing plan, "free" until upgraded through the paywall */
 plan?: "free" | "pro";
 /** Essays left in the current visible quota window; null = paid access */
 essaysRemaining?: number | null;
 billingPlan?: "student" | "power" | "sprint" | null;
 /** Signed session token proving identity to protected endpoints */
 token?: string;
}

// ─── Education ────────────────────────────────────────────────────────────────

export type EducationLevel =
 | "HIGH_SCHOOL"
 | "UNDERGRADUATE"
 | "GRADUATE"
 | "DOCTORAL"
 | "TRANSFER";

// ─── Achievement ──────────────────────────────────────────────────────────────

export type AchievementCategory =
 | "LEADERSHIP"
 | "ACADEMICS"
 | "SERVICE"
 | "ATHLETICS"
 | "ARTS"
 | "WORK"
 | "RESEARCH"
 | "ENTREPRENEURSHIP"
 | "AWARD"
 | "CERTIFICATION"
 | "OTHER";

export interface Achievement {
 id: string;
 title: string;
 category: AchievementCategory;
 organization?: string;
 role?: string;
 startDate?: string;
 endDate?: string;
 description?: string;
 impact?: string;
 metrics: string[];
 relatedStories: string[];
 essayUseCases: string[];
 isActive: boolean;
 createdAt: string;
}

// ─── Story ────────────────────────────────────────────────────────────────────

export type StoryCategory =
 | "CHALLENGE"
 | "LEADERSHIP"
 | "COMMUNITY_SERVICE"
 | "FAMILY_RESPONSIBILITY"
 | "ACADEMIC_GROWTH"
 | "FAILURE_RECOVERY"
 | "CULTURAL_TRANSITION"
 | "FINANCIAL_HARDSHIP"
 | "FIRST_GENERATION"
 | "RESEARCH"
 | "CAREER_DISCOVERY"
 | "ATHLETIC"
 | "CREATIVE"
 | "ENTREPRENEURSHIP"
 | "MORAL_COURAGE"
 | "IDENTITY_BELONGING"
 | "SERVICE"
 | "MENTORSHIP"
 | "WORK_ETHIC"
 | "RESILIENCE";

export interface Story {
 id: string;
 title: string;
 category: StoryCategory;
 summary: string;
 keyFacts: string[];
 emotionalCore: string;
 conflict: string;
 turningPoint: string;
 outcome: string;
 lesson: string;
 bestUseCases: string[];
 evidenceRefs: string[];
 riskNotes: string;
 followUpQuestions: string[];
 createdAt: string;
}

// ─── Student Profile / Knowledge Graph ────────────────────────────────────────

export interface StudentProfile {
 id: string;
 userId: string;

 // Basic
 fullName: string;
 email: string;
 phone?: string;
 location?: string;
 /** US state/territory for local scholarship matching (e.g. "Georgia") */
 state?: string;
 /** Household income bracket for need-based eligibility */
 incomeLevel?: string;

 // Education
 schoolName?: string;
 graduationYear?: number;
 educationLevel?: EducationLevel;
 major?: string;
 intendedMajor?: string;
 gpa?: number;
 testScores?: { type: string; score: string }[];

 // Goals
 careerInterests: string[];
 longTermGoals?: string;
 shortTermGoals?: string;

 // Eligibility
 citizenship?: string;
 isFirstGeneration?: boolean;
 isInternational?: boolean;
 financialNeedContext?: string;
 demographics: string[];
 hasDisability?: boolean;
 isMilitaryFamily?: boolean;

 // Skills
 languages: string[];
 skills: string[];
 certifications: string[];

 // Community
 communityBackground?: string;

 // Achievements
 achievements: Achievement[];

 // Stories
 stories: Story[];

 // Profile strength
 profileStrength: number;
 profileStrengthBreakdown: ProfileStrengthBreakdown;

 // Preferences
 scholarshipPreferences: ScholarshipPreferences;

 createdAt: string;
 updatedAt: string;
}

export interface ProfileStrengthBreakdown {
 academics: number;
 leadership: number;
 service: number;
 workExperience: number;
 awards: number;
 storyDepth: number;
 careerClarity: number;
 financialNeedClarity: number;
 applicationReadiness: number;
 recommendationReadiness: number;
}

export interface ScholarshipPreferences {
 minAmount?: number;
 maxTimePerApplication?: number; // hours
 preferLocal?: boolean;
 preferNoEssay?: boolean;
 categories: string[];
}

// ─── Scholarship ──────────────────────────────────────────────────────────────

export type ScholarshipSource = "MANUAL" | "PASTE" | "DATABASE" | "AGENT";

export type ApplicationStatus =
 | "SAVED"
 | "IN_PROGRESS"
 | "DRAFT_READY"
 | "MISSING_MATERIALS"
 | "SUBMITTED"
 | "INTERVIEW"
 | "WON"
 | "REJECTED"
 | "ARCHIVED";

export interface ScholarshipEssayPrompt {
 id: string;
 prompt: string;
 wordLimit?: number;
 required: boolean;
}

export interface ScholarshipRequirements {
 resumeRequired: boolean;
 transcriptRequired: boolean;
 recommendationLetters: number;
 financialDocuments: boolean;
 portfolioRequired: boolean;
 interviewRequired: boolean;
 otherDocuments: string[];
}

export interface Scholarship {
 id: string;
 name: string;
 organization: string;
 amount?: number;
 amountText: string;
 deadline?: string;
 deadlineText?: string;
 description: string;
 eligibility: string;
 eligibilityRules?: EligibilityRules;
 prompts: ScholarshipEssayPrompt[];
 requirements: ScholarshipRequirements;
 applicationUrl?: string;
 contactEmail?: string;
 isNational: boolean;
 state?: string;
 categories: string[];
 tags: string[];
 source: ScholarshipSource;
 createdAt: string;
}

export interface EligibilityRules {
 minGpa?: number;
 maxGpa?: number;
 educationLevel?: EducationLevel[];
 majors?: string[];
 states?: string[];
 citizenship?: string[];
 demographics?: string[];
 isFirstGenOnly?: boolean;
 isNeedBased?: boolean;
 isMeritBased?: boolean;
}

// ─── Match / Scoring ─────────────────────────────────────────────────────────

export interface MatchScoreBreakdown {
 eligibility: number;
 majorFit: number;
 gpaFit: number;
 locationFit: number;
 gradeLevelFit: number;
 citizenshipFit: number;
 demographicFit: number;
 careerAlignment: number;
 leadershipAlignment: number;
 serviceAlignment: number;
 essayAlignment: number;
}

export interface MatchScore {
 total: number;
 breakdown: MatchScoreBreakdown;
 strengths: string[];
 gaps: string[];
 eligible: boolean;
 eligibilityUncertain: boolean;
}

export type ProbabilityLevel =
 | "LOW"
 | "MODERATE"
 | "MEDIUM_HIGH"
 | "HIGH"
 | "UNKNOWN";

export interface ProbabilityScore {
 level: ProbabilityLevel;
 confidence: "LOW" | "MODERATE" | "HIGH";
 reasons: string[];
 improvements: string[];
}

export interface ROIScore {
 score: number;
 estimatedHours: number;
 amountPerHour?: number;
 reasons: string[];
 recommendation: string;
}

// ─── Saved Scholarship / Application ─────────────────────────────────────────

export interface SavedScholarship {
 id: string;
 userId: string;
 scholarship: Scholarship;
 status: ApplicationStatus;
 matchScore?: MatchScore;
 probabilityScore?: ProbabilityScore;
 roiScore?: ROIScore;
 notes?: string;
 checklist: ChecklistItem[];
 bestStory?: Story;
 essayDrafts: EssayDraft[];
 deadline?: string;
 submittedAt?: string;
 createdAt: string;
 updatedAt: string;
}

export interface ChecklistItem {
 id: string;
 label: string;
 completed: boolean;
 required: boolean;
}

// ─── Essay ────────────────────────────────────────────────────────────────────

export interface EssayDraft {
 id: string;
 savedScholarshipId?: string;
 storyId?: string;
 prompt?: string;
 wordLimit?: number;
 content: string;
 strategy?: string;
 scores?: EssayScores;
 feedback?: EssayFeedback;
 versions: EssayVersion[];
 createdAt: string;
 updatedAt: string;
}

export interface EssayScores {
 overall: number;
 promptAlignment: number;
 specificity: number;
 storyStrength: number;
 emotionalAuthenticity: number;
 scholarshipFit: number;
 structure: number;
 clarity: number;
 openingStrength: number;
 conclusionStrength: number;
 wordCountFit: number;
 clicheRisk: number; // lower is better
 aiSoundingRisk: number; // lower is better
}

export interface EssayFeedback {
 strengths: string[];
 weaknesses: string[];
 revisions: string[];
 wordCount: number;
 targetWordCount?: number;
}

export interface EssayVersion {
 id: string;
 content: string;
 note?: string;
 createdAt: string;
}

// ─── Gap Analysis ─────────────────────────────────────────────────────────────

export type GapSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ProfileGap {
 id: string;
 category: string;
 title: string;
 severity: GapSeverity;
 whyItMatters: string;
 quickFix: string;
 longTermFix: string;
 actionPlan: string[];
}

export interface GapAnalysis {
 id: string;
 profileId: string;
 gaps: ProfileGap[];
 overallScore: number;
 categoryScores: Record<string, number>;
 topPriorities: string[];
 createdAt: string;
}

// ─── Resume ──────────────────────────────────────────────────────────────────

export type ResumeType =
 | "SCHOLARSHIP"
 | "COLLEGE"
 | "INTERNSHIP"
 | "RESEARCH"
 | "LEADERSHIP"
 | "SERVICE";

export interface ResumeSection {
 id: string;
 type:
 | "HEADER"
 | "EDUCATION"
 | "EXPERIENCE"
 | "LEADERSHIP"
 | "SERVICE"
 | "AWARDS"
 | "SKILLS"
 | "PROJECTS"
 | "CUSTOM";
 title: string;
 items: ResumeSectionItem[];
 order: number;
}

export interface ResumeSectionItem {
 id: string;
 title: string;
 organization?: string;
 location?: string;
 startDate?: string;
 endDate?: string;
 bullets: string[];
}

export interface Resume {
 id: string;
 profileId: string;
 title: string;
 type: ResumeType;
 sections: ResumeSection[];
 template: string;
 createdAt: string;
 updatedAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
 totalDiscovered: number;
 realisticTarget: number;
 totalApplied: number;
 totalPending: number;
 totalWon: number;
 deadlinesThisWeek: number;
 deadlinesThisMonth: number;
 applicationCompletionRate: number;
 profileStrength: number;
}

// ─── AI Functions ─────────────────────────────────────────────────────────────

export interface ParsedScholarship {
 name: string;
 organization: string;
 amountText: string;
 amount?: number;
 deadlineText?: string;
 deadline?: string;
 description: string;
 eligibility: string;
 eligibilityRules?: EligibilityRules;
 prompts: ScholarshipEssayPrompt[];
 requirements: ScholarshipRequirements;
 applicationUrl?: string;
 contactEmail?: string;
 categories: string[];
}

export interface OnboardingData {
 step: number;
 resumeText?: string;
 voiceTranscript?: string;
 manualEntries?: Partial<StudentProfile>;
}
