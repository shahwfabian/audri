import type { EssayEvalFixture } from "../lib/evals/essayAutoresearch";

export const essayAutoresearchFixtures: EssayEvalFixture[] = [
  {
    id: "community-food-pantry-grounded",
    prompt: "Describe a time you served your community and how this scholarship will help you continue that work.",
    wordLimit: 180,
    studentFacts: [
      "packed pantry boxes",
      "translated the questions|intake forms",
      "community college nursing",
    ],
    scholarshipFacts: [
      "local service",
      "health careers",
    ],
    requiredIdeas: [
      "packed pantry boxes",
      "translated the questions|intake forms",
      "community college nursing|nursing",
      "local service",
      "health careers|health career",
    ],
    forbiddenClaims: [
      "founded the pantry",
      "raised $10000",
      "full ride",
      "doctor",
      "asked why",
      "she told me",
    ],
    essay:
      "The cardboard flaps fought back each Saturday morning while I packed pantry boxes beside my mother. I learned the route by sound: canned beans sliding left, rice landing soft, my pen scratching names onto intake forms. When a neighbor hesitated over the English form, I translated the questions and watched her shoulders drop. That small breath is why I want community college nursing. Local service taught me that health careers begin before the clinic door, in the moment someone feels safe enough to ask for help. This scholarship would keep me moving toward that work while I keep showing up where my neighborhood already knows my name.",
  },
  {
    id: "community-food-pantry-fabricated",
    prompt: "Describe a time you served your community and how this scholarship will help you continue that work.",
    wordLimit: 120,
    studentFacts: [
      "packed pantry boxes",
      "translated intake forms",
      "community college nursing",
    ],
    scholarshipFacts: [
      "local service",
      "health careers",
    ],
    requiredIdeas: [
      "packed pantry boxes",
      "translated intake forms",
      "community college nursing|nursing",
      "local service",
      "health careers|health career",
    ],
    forbiddenClaims: [
      "founded the pantry",
      "raised $10000",
      "full ride",
      "doctor",
    ],
    essay:
      "I founded the pantry, raised $10000, and became the leader my city needed. This full ride will help me become a doctor.",
  },
];
