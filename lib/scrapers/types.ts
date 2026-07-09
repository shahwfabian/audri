export interface ScrapedScholarship {
  id: string;
  name: string;
  organization: string;
  amountText: string;
  amount?: number;
  deadlineText?: string;
  deadline?: string;
  description: string;
  eligibility: string;
  applicationUrl?: string;
  source:
    | "scholarships.com"
    | "fastweb.com"
    | "how2winscholarships.com"
    | "bigfuture.collegeboard.org"
    | "scholarships360.org"
    | "scholarshipamerica.org"
    | "scholarshipowl.com"
    | "bold.org"
    | "local"
    | "seed";
  categories: string[];
  tags: string[];
  prompts: Array<{ id: string; prompt: string; wordLimit?: number; required: boolean }>;
  requirements: {
    resumeRequired: boolean;
    transcriptRequired: boolean;
    recommendationLetters: number;
    financialDocuments: boolean;
    portfolioRequired: boolean;
    interviewRequired: boolean;
    otherDocuments: string[];
  };
  scrapedAt: string;
}

export interface ScholarshipDatabase {
  lastUpdated: string;
  totalCount: number;
  scholarships: ScrapedScholarship[];
}
