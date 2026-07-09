// lib/scholarships/types.ts

export type Scholarship = {
  title: string;
  organization?: string;
  description?: string;

  awardAmountMin?: number | null;
  awardAmountMax?: number | null;
  deadline?: string | null;

  eligibility?: {
    gpa?: string | null;
    gradeLevel?: string[];
    major?: string[];
    citizenship?: string | null;
    state?: string[];
    demographics?: string[];
    financialNeed?: boolean | null;
    other?: string[];
  };

  requirements?: {
    resume?: boolean;
    transcript?: boolean;
    recommendationLetters?: number;
    essays?: boolean;
    portfolio?: boolean;
    other?: string[];
  };

  essayPrompts?: {
    prompt: string;
    wordLimit?: number | null;
  }[];

  applicationUrl?: string | null;
  sourceName?: string;
  sourceUrl?: string;
  confidenceScore?: number;
};

/** Row returned from the Supabase scholarships table. */
export type ScholarshipRow = Scholarship & {
  id: string;
  normalized_key: string;
  status: "active" | "expired";
  created_at: string;
  updated_at: string;
};
