import assert from "node:assert/strict";
import test from "node:test";
import { hasEssayMaterial } from "../lib/ai/essayReadiness";
import { isNonEssayResponse } from "../lib/ai/nonEssayResponse";
import { STORY_DETAIL_MARKER, STORY_STARTERS, starterToNote } from "../lib/ai/storyStarters";

test("empty and biography-only profiles need essay material", () => {
 assert.equal(hasEssayMaterial({}, [], ""), false);
 assert.equal(hasEssayMaterial({ achievements: [], stories: [] }, [], ""), false);
 assert.equal(
  hasEssayMaterial(
   { achievements: [], stories: [] },
   [],
   "I want to become an engineer."
 ),
 false
 );
 assert.equal(
  hasEssayMaterial(
   { achievements: [], stories: [] },
   [],
   "I want to become an engineer because I care about helping people in my community someday."
  ),
  false
 );
});

test("advisor-mode model output is not accepted as an essay", () => {
 const response = `I need to be direct with you before I write a single word.

What I need from the student:
1. Is she a first-generation student?
2. What jobs has she held?
3. What project has she worked on?`;

 assert.equal(isNonEssayResponse(response), true);
 assert.equal(isNonEssayResponse("The library lights hummed while I reread the scholarship prompt."), false);
});

test("a detailed achievement, story, or note is enough", () => {
 assert.equal(
  hasEssayMaterial({
   achievements: [{
    id: "achievement_1",
    title: "Library volunteer",
    description: "I rebuilt the weekend checkout process after noticing long lines.",
    metrics: [],
    relatedStories: [],
    essayUseCases: [],
    isActive: true,
    category: "SERVICE",
    createdAt: "2026-01-01",
   }],
  }, [], ""),
  true
 );

 assert.equal(
  hasEssayMaterial({ achievements: [], stories: [] }, [{
   summary: "During my first lab project, I stayed after class to rebuild a failed sensor.",
  }], ""),
  true
 );

 assert.equal(
 hasEssayMaterial({}, [], "I translated the lease for my mother and caught a fee that was listed twice."),
 true
 );
 assert.equal(
  hasEssayMaterial({}, [], "I care for my younger brother every evening while my mother works the late shift."),
  true
 );
});

test("a story direction still requires the student's real details", () => {
 const direction = starterToNote(STORY_STARTERS[0]);
 assert.match(direction, new RegExp(STORY_DETAIL_MARKER));
 assert.equal(hasEssayMaterial({}, [], direction), false);
 assert.equal(
  hasEssayMaterial({}, [], `${direction} I opened the store at 5 a.m. every Saturday while my supervisor recovered from surgery.`),
  true
 );
});
