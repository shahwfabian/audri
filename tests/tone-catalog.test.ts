import assert from "node:assert/strict";
import test from "node:test";
import {
 DEFAULT_TONE_ID,
 TONE_ARCHETYPES,
 TONE_COUNT,
 TONE_LIBRARY,
 TONE_REGISTERS,
 TONE_TEXTURES,
 composeToneId,
 getToneDescription,
 getToneLabel,
 parseToneId,
 searchToneOptions,
} from "../lib/ai/tones";

test("voice catalogue exposes every unique facet combination", () => {
 assert.equal(TONE_COUNT, TONE_ARCHETYPES.length * TONE_TEXTURES.length * TONE_REGISTERS.length);
 assert.equal(TONE_COUNT, 1_440);
 assert.equal(new Set(TONE_LIBRARY.map((option) => option.id)).size, TONE_COUNT);
});

test("voice catalogue composes and explains a deliberate selection", () => {
 const id = composeToneId({ archetype: "advocate", texture: "bold", register: "polished" });
 assert.deepEqual(parseToneId(id), { archetype: "advocate", texture: "bold", register: "polished" });
 assert.equal(getToneLabel(id), "Bold Advocate · Polished");
 assert.match(getToneDescription(id) ?? "", /conviction/i);
 assert.match(getToneDescription(id) ?? "", /professional/i);
});

test("voice catalogue search finds combinations by any ingredient", () => {
 const matches = searchToneOptions("candid realist plainspoken", TONE_COUNT);
 assert.equal(matches.length, 1);
 assert.equal(matches[0].id, "realist.candid.plainspoken");
 assert.ok(searchToneOptions("warm storyteller", TONE_COUNT).length > 1);
 assert.equal(searchToneOptions("not-a-real-voice", TONE_COUNT).length, 0);
});

test("default voice is a valid catalogue recipe", () => {
 assert.ok(parseToneId(DEFAULT_TONE_ID));
 assert.ok(getToneDescription(DEFAULT_TONE_ID));
});
