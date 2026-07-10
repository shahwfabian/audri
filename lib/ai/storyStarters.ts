/**
 * Audri Story Studio
 *
 * A curated library of the story archetypes real students actually live, * from the humble (a delivery job that paid the bills) to the ambitious
 * (launching the region's biggest conference). Each starter carries:
 *
 * - a SURFACING QUESTION that helps the student dig out THEIR specific,
 * true version (Audri never fabricates, these frame real experience),
 * - METAPHOR LENSES: the show-don't-tell vehicle. Every winning essay in
 * "Accepted! 50 Successful Essays" turned a fact into a scene through a
 * metaphor (cheese, banana pancakes, a piano named Wurly, weightlifting
 * as learning). These give the student that lever.
 * - PAIRS-WITH: the voice archetypes from the tone system that best carry
 * this kind of story.
 *
 * ETHICS: a starter is a mirror, not a mask. The student picks the theme that
 * matches their real life; Audri helps them tell it, never invents it.
 */

export interface StoryStarter {
 id: string;
 category: string;
 title: string;
 /** The lived experience this draws on (helps the student self-select honestly). */
 experience: string;
 /** A question that pulls out the student's own specific, true details. */
 surfacingQuestion: string;
 /** Metaphorical lenses to frame the real experience as a scene. */
 metaphors: string[];
 /** Voice archetypes (from the tone system) this pairs with. */
 pairsWith: string[];
}

export const STORY_CATEGORIES = [
 "Work, Hustle & Grit",
 "Identity, Culture & Language",
 "Building, Leading & Founding",
 "Overcoming & Resilience",
 "Care & Responsibility",
 "Everyday Objects & Rituals",
 "Curiosity & Craft",
 "Service & Community",
] as const;

export const STORY_STARTERS: StoryStarter[] = [
 // ── Work, Hustle & Grit ─────────────────────────────────────────────────
 {
 id: "delivery-driver",
 category: "Work, Hustle & Grit",
 title: "The Job That Paid the Bills",
 experience: "Delivering for DoorDash/Uber Eats, a paper route, rideshare, or gig work to help at home.",
 surfacingQuestion: "What did one ordinary shift actually feel like, a specific night, a specific order, what was running through your head between stops?",
 metaphors: [
 "the city as a circuit board you learned to route by feel",
 "each delivery a small promise kept to a stranger",
 "your car as a second classroom with the meter always running",
 "the map app rerouting you the way life kept rerouting your plans",
 ],
 pairsWith: ["Underdog", "Realist", "Straight Shooter", "Fighter"],
 },
 {
 id: "family-business",
 category: "Work, Hustle & Grit",
 title: "Behind the Family Counter",
 experience: "Working the register, kitchen, or floor of a family store, restaurant, salon, or farm.",
 surfacingQuestion: "What was the one task you dreaded that quietly taught you the most, and who did you watch do it before you?",
 metaphors: [
 "the cash drawer as a ledger of everything unspoken between you and your parents",
 "the rush hour as a machine you all became parts of",
 "learning the business the way you learn a first language, by absorption, not instruction",
 ],
 pairsWith: ["Humanist", "Storyteller", "Craftsman", "Realist"],
 },
 {
 id: "first-paycheck",
 category: "Work, Hustle & Grit",
 title: "The First Real Paycheck",
 experience: "A first job, fast food, retail, lifeguarding, warehouse, camp counselor, and what the money meant.",
 surfacingQuestion: "What did you spend (or refuse to spend) that first paycheck on, and what did that decision reveal about you?",
 metaphors: [
 "the paycheck as the first brick you laid yourself",
 "the name tag as a costume you slowly stopped needing",
 "clocking in as crossing a border into an adult country",
 ],
 pairsWith: ["Underdog", "Optimist", "Builder", "Straight Shooter"],
 },
 {
 id: "night-shift",
 category: "Work, Hustle & Grit",
 title: "The Hours No One Sees",
 experience: "Early mornings or late nights, a shift before school, studying after closing, two things at once.",
 surfacingQuestion: "Describe the exact moment of one of those mornings or nights, the light, the tiredness, the reason you kept going.",
 metaphors: [
 "the 4 a.m. alarm as a handshake with your future self",
 "exhaustion as a tax you paid on a dream",
 "the empty streets as proof you were awake for something",
 ],
 pairsWith: ["Fighter", "Realist", "Minimalist", "Underdog"],
 },

 // ── Identity, Culture & Language ────────────────────────────────────────
 {
 id: "family-translator",
 category: "Identity, Culture & Language",
 title: "The Family Translator",
 experience: "Translating for parents or grandparents, at the bank, the doctor, the parent-teacher conference.",
 surfacingQuestion: "Recall one conversation you had to translate that was above your age, what were you carrying that no kid should have to?",
 metaphors: [
 "the bridge that carries traffic in both directions at once",
 "living in the seam between two languages, stitching it closed daily",
 "becoming the family's interpreter before you could interpret yourself",
 ],
 pairsWith: ["Bridge-Builder", "Humanist", "Quiet Observer", "Poet"],
 },
 {
 id: "two-cultures",
 category: "Identity, Culture & Language",
 title: "Two Worlds, One Kid",
 experience: "Growing up between an immigrant home and an American school, different food, rules, expectations.",
 surfacingQuestion: "What is one small daily object or ritual that only makes sense in one of your two worlds?",
 metaphors: [
 "code-switching as changing keys mid-song without missing a beat",
 "your two cultures as tectonic plates, the friction is where you were formed",
 "the lunchbox as a small act of translation every single day",
 ],
 pairsWith: ["Storyteller", "Humanist", "Seeker", "Bridge-Builder"],
 },
 {
 id: "name-story",
 category: "Identity, Culture & Language",
 title: "The Story of My Name",
 experience: "A name that gets mispronounced, shortened, or carries family history most people never ask about.",
 surfacingQuestion: "Who named you, why, and what happens in the half-second before a stranger tries to say it?",
 metaphors: [
 "your name as a small inheritance you decide whether to spend or protect",
 "each mispronunciation a tiny erosion you learned to withstand",
 "the name as a door, most people knock, few walk through",
 ],
 pairsWith: ["Poet", "Advocate", "Quiet Observer", "Storyteller"],
 },
 {
 id: "faith-tradition",
 category: "Identity, Culture & Language",
 title: "What I Inherited to Believe",
 experience: "A faith, tradition, or set of values from family, kept, questioned, or made your own.",
 surfacingQuestion: "What is one belief you were handed that you've since tested against your own life, and where did it hold or bend?",
 metaphors: [
 "tradition as a recipe you finally started adjusting to your own taste",
 "faith as a house you were raised in and are now deciding how to furnish",
 "the ritual as a rope tying you to people you'll never meet",
 ],
 pairsWith: ["Seeker", "Mentor", "Humanist", "Realist"],
 },

 // ── Building, Leading & Founding ────────────────────────────────────────
 {
 id: "launched-event",
 category: "Building, Leading & Founding",
 title: "The Thing I Built From Nothing",
 experience: "Launching a conference, club, nonprofit, team, or event, often the biggest of its kind locally.",
 surfacingQuestion: "What was the moment it almost fell apart, and what small, unglamorous thing did you do to save it?",
 metaphors: [
 "conducting an orchestra before you could read the score",
 "a machine with two hundred moving parts and your name on the switch",
 "building the plane while already taxiing down the runway",
 ],
 pairsWith: ["Builder", "Visionary", "Trailblazer", "Advocate"],
 },
 {
 id: "started-business",
 category: "Building, Leading & Founding",
 title: "My First Venture",
 experience: "A small business, side hustle, resale flip, app, or service you started and ran yourself.",
 surfacingQuestion: "What did your first customer or first failure teach you that no class ever did?",
 metaphors: [
 "your spreadsheet as the first place you learned to turn chaos into a system",
 "the first sale as proof a stranger would bet on you",
 "the venture as a lab where every mistake was tuition you paid in real money",
 ],
 pairsWith: ["Builder", "Analyst", "Trailblazer", "Straight Shooter"],
 },
 {
 id: "team-captain",
 category: "Building, Leading & Founding",
 title: "When They Made Me Lead",
 experience: "Captain, president, editor, section leader, the day responsibility for others landed on you.",
 surfacingQuestion: "Describe the hardest conversation you had to have with someone you led, and what you learned about yourself in it.",
 metaphors: [
 "leadership as the load-bearing wall no one photographs",
 "the team as an instrument you had to tune person by person",
 "carrying the group the way you carry water, steady, or you spill it",
 ],
 pairsWith: ["Mentor", "Advocate", "Humanist", "Bridge-Builder"],
 },
 {
 id: "coded-built",
 category: "Building, Leading & Founding",
 title: "I Made It Work",
 experience: "Coding an app, engineering a robot, fixing a car, wiring a system, building something that runs.",
 surfacingQuestion: "What was the bug or break that beat you for days, and what did finally solving it feel like?",
 metaphors: [
 "debugging as a conversation with a machine that only tells the truth",
 "the build as a puzzle where you also had to invent half the pieces",
 "the moment it finally ran as a light coming on in a room you wired yourself",
 ],
 pairsWith: ["Builder", "Scientist", "Craftsman", "Analyst"],
 },

 // ── Overcoming & Resilience ─────────────────────────────────────────────
 {
 id: "injury-comeback",
 category: "Overcoming & Resilience",
 title: "The Injury That Changed the Plan",
 experience: "An injury or illness that ended one path and forced a new one.",
 surfacingQuestion: "What did you lose that you thought defined you, and what did you find in the space it left?",
 metaphors: [
 "rebuilding the engine while the race kept running",
 "the cast as a pause button you didn't press yourself",
 "learning to walk a second way toward the same place",
 ],
 pairsWith: ["Fighter", "Realist", "Seeker", "Optimist"],
 },
 {
 id: "learning-difference",
 category: "Overcoming & Resilience",
 title: "The Way My Brain Works",
 experience: "A learning difference, ADHD, dyslexia, anxiety, or a stutter you learned to work with.",
 surfacingQuestion: "What is one workaround you invented that a teacher never taught you, and what did building it prove?",
 metaphors: [
 "your mind as a machine wired differently, not wired wrong",
 "the workaround as a trail you cut because the paved road didn't fit you",
 "the stutter as a toll booth on every sentence you learned to pay without stopping",
 ],
 pairsWith: ["Candid", "Realist", "Seeker", "Advocate"],
 },
 {
 id: "money-tight",
 category: "Overcoming & Resilience",
 title: "When Money Was Tight",
 experience: "Financial hardship at home, going without, budgeting young, watching parents stretch a dollar.",
 surfacingQuestion: "What is one thing your family did without that most classmates never noticed, and how did you carry it?",
 metaphors: [
 "the grocery list as a math problem you learned to solve before algebra",
 "scarcity as a strict teacher whose lessons stuck",
 "watching your parents stretch a dollar the way others watch an athlete, with awe",
 ],
 pairsWith: ["Realist", "Underdog", "Humanist", "Straight Shooter"],
 },
 {
 id: "starting-over",
 category: "Overcoming & Resilience",
 title: "Starting Over Somewhere New",
 experience: "Moving countries, schools, or homes, being the new person and rebuilding from scratch.",
 surfacingQuestion: "Describe your first day in the new place, one image, one sound, the exact feeling of not belonging yet.",
 metaphors: [
 "the new school as a language you had to learn without a textbook",
 "belonging as a fire you had to build from wet wood",
 "starting over as replanting yourself and waiting, unsure, for roots",
 ],
 pairsWith: ["Seeker", "Storyteller", "Optimist", "Quiet Observer"],
 },

 // ── Care & Responsibility ───────────────────────────────────────────────
 {
 id: "caregiver",
 category: "Care & Responsibility",
 title: "The Second Parent",
 experience: "Raising siblings, caring for a grandparent, or running the house while parents worked.",
 surfacingQuestion: "What is one adult responsibility you held young that your friends never had to, and what did a normal Tuesday look like?",
 metaphors: [
 "becoming the family's quiet infrastructure, the pipes no one thanks",
 "the load-bearing wall holding up a house you didn't build",
 "childhood as something you handed to someone smaller so they could keep theirs",
 ],
 pairsWith: ["Humanist", "Tender", "Mentor", "Realist"],
 },
 {
 id: "caring-for-sick",
 category: "Care & Responsibility",
 title: "When I Became the Caretaker",
 experience: "Caring for a sick or disabled family member, appointments, medication, translation, presence.",
 surfacingQuestion: "What did you learn to do that no one your age should have to, and what did the routine of it teach you?",
 metaphors: [
 "the pill organizer as a small calendar of love and fear",
 "the waiting room as a classroom in patience and dread",
 "being present as the one skill that couldn't be outsourced",
 ],
 pairsWith: ["Tender", "Humanist", "Quiet Observer", "Mentor"],
 },
 {
 id: "protecting-sibling",
 category: "Care & Responsibility",
 title: "Looking Out for Them",
 experience: "Shielding or guiding a younger sibling, walking them to school, covering for them, setting the example.",
 surfacingQuestion: "What is one thing you did to protect them that they'll probably never know about?",
 metaphors: [
 "being the older sibling as walking point on a trail you'd never hiked either",
 "the example you set as a path you cleared with your own missteps",
 "your shadow as the first shade they ever stood in",
 ],
 pairsWith: ["Mentor", "Humanist", "Storyteller", "Tender"],
 },

 // ── Everyday Objects & Rituals ──────────────────────────────────────────
 {
 id: "grandmothers-recipe",
 category: "Everyday Objects & Rituals",
 title: "The Recipe With No Measurements",
 experience: "A family dish, ritual, or object that carries more meaning than it looks like it should.",
 surfacingQuestion: "What is the object or dish, who taught it to you, and what invisible thing does it actually hold?",
 metaphors: [
 "measurements passed down like a language with no written form",
 "the dish as a photograph you can taste",
 "the recipe as a rope of small motions tying four generations together",
 ],
 pairsWith: ["Poet", "Storyteller", "Craftsman", "Humanist"],
 },
 {
 id: "the-instrument",
 category: "Everyday Objects & Rituals",
 title: "Me and the Instrument",
 experience: "An instrument, tool, or piece of gear you have a relationship with (à la the piano named 'Wurly').",
 surfacingQuestion: "If your instrument or tool could describe you, what would it say it has watched you become?",
 metaphors: [
 "the instrument as a stubborn friend who only rewards the hours",
 "practice as a conversation only the two of you can hear",
 "the worn spot on it as a map of every hour you gave",
 ],
 pairsWith: ["Poet", "Craftsman", "Storyteller", "Minimalist"],
 },
 {
 id: "the-route",
 category: "Everyday Objects & Rituals",
 title: "The Walk I Know by Heart",
 experience: "A daily route, commute, or place you pass through that frames who you are (à la Jack London Square).",
 surfacingQuestion: "Walk me through it, what do you see, and what does each stretch of it quietly say about your life?",
 metaphors: [
 "the route as a timeline you retrace with your feet",
 "the neighborhood as a book you can read because you live inside it",
 "each landmark as a chapter only you know the plot of",
 ],
 pairsWith: ["Quiet Observer", "Poet", "Storyteller", "Seeker"],
 },
 {
 id: "the-collection",
 category: "Everyday Objects & Rituals",
 title: "The Thing I Can't Stop Collecting",
 experience: "A collection, obsession, or pile of stuff (books, sneakers, parts, notes) that maps your mind.",
 surfacingQuestion: "What do you collect, and what does the pattern of what you keep reveal that you'd never say out loud?",
 metaphors: [
 "the collection as a self-portrait made of small choices",
 "your shelves as a foundation of paper the rest of your life is built on",
 "each item as a fossil of a version of you",
 ],
 pairsWith: ["Craftsman", "Quiet Observer", "Analyst", "Poet"],
 },

 // ── Curiosity & Craft ───────────────────────────────────────────────────
 {
 id: "niche-obsession",
 category: "Curiosity & Craft",
 title: "My Weird Obsession",
 experience: "A niche interest most people don't get, bugs, chess openings, a video game economy, trains, cheese.",
 surfacingQuestion: "What is the obsession, and what is the exact thing about it that lights you up that others shrug at?",
 metaphors: [
 "the obsession as a door most people walk past that opened into everything for you",
 "the niche as a small country where you're fluent and everyone else is a tourist",
 "curiosity as a thread you pulled until it unspooled a whole self",
 ],
 pairsWith: ["Scientist", "Craftsman", "Trailblazer", "Poet"],
 },
 {
 id: "research-project",
 category: "Curiosity & Craft",
 title: "The Question I Chased",
 experience: "A research project, experiment, or deep investigation you pursued past the assignment.",
 surfacingQuestion: "What question grabbed you, why wouldn't it let go, and what surprised you about the answer?",
 metaphors: [
 "the question as an itch no shortcut could reach",
 "research as digging a well, most of it is dark before the water",
 "the hypothesis as a bet you placed on your own curiosity",
 ],
 pairsWith: ["Scientist", "Analyst", "Seeker", "Craftsman"],
 },
 {
 id: "art-practice",
 category: "Curiosity & Craft",
 title: "What I Make",
 experience: "Art, writing, film, dance, design, a creative practice that is how you think, not just what you do.",
 surfacingQuestion: "What is the one piece you made that finally felt true, and what did making it cost or reveal?",
 metaphors: [
 "the blank page as a mirror that only fills in when you're honest",
 "revision as sanding a shape until you recognize your own hand in it",
 "the craft as a second language you're more fluent in than your first",
 ],
 pairsWith: ["Poet", "Craftsman", "Seeker", "Storyteller"],
 },
 {
 id: "self-taught",
 category: "Curiosity & Craft",
 title: "I Taught Myself",
 experience: "A skill learned outside of school, a language, an instrument, coding, a trade, with only the internet and stubbornness.",
 surfacingQuestion: "What did you learn on your own, what almost made you quit, and why didn't you?",
 metaphors: [
 "YouTube tutorials as the only teacher awake at 2 a.m.",
 "self-teaching as building a ladder while climbing it",
 "the skill as a country you visited without a guide and decided to stay",
 ],
 pairsWith: ["Trailblazer", "Builder", "Underdog", "Scientist"],
 },

 // ── Service & Community ─────────────────────────────────────────────────
 {
 id: "mentoring-others",
 category: "Service & Community",
 title: "Passing It Down",
 experience: "Tutoring, coaching, or mentoring younger kids, teaching what someone once taught you.",
 surfacingQuestion: "Who is the one student or kid whose breakthrough you'll never forget, and what did it teach YOU?",
 metaphors: [
 "teaching as lighting a candle from your own without losing the flame",
 "the mentee's breakthrough as a mirror showing how far you'd come",
 "passing it down as repaying a debt to someone who never asked to be repaid",
 ],
 pairsWith: ["Mentor", "Humanist", "Optimist", "Bridge-Builder"],
 },
 {
 id: "local-impact",
 category: "Service & Community",
 title: "Fixing Something in My Town",
 experience: "A concrete local problem you worked on, a food drive, a cleanup, a policy, a program that stuck.",
 surfacingQuestion: "What specific problem did you see that others walked past, and what is the smallest real change you made?",
 metaphors: [
 "the problem as a pothole everyone complained about and you finally filled",
 "change as a stone dropped in your own pond first",
 "the community as a garden you chose to weed instead of just admire",
 ],
 pairsWith: ["Advocate", "Builder", "Realist", "Humanist"],
 },
 {
 id: "activism",
 category: "Service & Community",
 title: "The Cause I Couldn't Ignore",
 experience: "Organizing, advocacy, or activism around something that hit close to home.",
 surfacingQuestion: "What personal moment turned this from an issue into YOUR issue, and what did you actually do about it?",
 metaphors: [
 "the cause as a fire that started in your own house before you fought others'",
 "your voice as the first domino you were willing to tip",
 "advocacy as carrying a lantern down a hallway you knew was dark",
 ],
 pairsWith: ["Advocate", "Fighter", "Visionary", "Bridge-Builder"],
 },
 {
 id: "showing-up",
 category: "Service & Community",
 title: "Just Showing Up",
 experience: "Quiet, consistent service, the volunteer shift you never skipped, the person you were always there for.",
 surfacingQuestion: "What did you keep showing up for when it was boring or thankless, and why did it matter to you?",
 metaphors: [
 "consistency as the unglamorous engine under every visible win",
 "showing up as a vote you cast for someone else, over and over",
 "reliability as a quiet kind of love most people overlook",
 ],
 pairsWith: ["Humanist", "Minimalist", "Mentor", "Quiet Observer"],
 },
];

export const STORY_STARTER_COUNT = STORY_STARTERS.length;

export function getStarterById(id: string | undefined | null): StoryStarter | undefined {
 if (!id) return undefined;
 return STORY_STARTERS.find((s) => s.id === id);
}

/** Turn a chosen starter + metaphor into a note the essay engine can use as an angle. */
export function starterToNote(starter: StoryStarter, metaphor?: string): string {
 const lens = metaphor ? `\nFrame it through this lens: ${metaphor}.` : "";
 return `Center this essay on my real experience: ${starter.title.toLowerCase()}, ${starter.experience}${lens}\n(This is my own true experience; use only the specifics I provide.)`;
}
