import { evaluateEssayFixture, summarizeEssayEval } from "@/lib/evals/essayAutoresearch";
import { essayAutoresearchFixtures } from "../tests/autoresearch-fixtures";

const results = essayAutoresearchFixtures.map(evaluateEssayFixture);
const summary = summarizeEssayEval(results);

console.log("fixture\tscore\tstatus\twords\tmissing_required\tforbidden_claims");
for (const result of results) {
  console.log(
    [
      result.id,
      result.score.toFixed(2),
      result.status,
      result.wordCount,
      result.missingRequiredIdeas.join("|") || "-",
      result.forbiddenClaimsFound.join("|") || "-",
    ].join("\t")
  );
}

console.log(
  JSON.stringify(
    {
      metric: "essay_autoresearch_average_score",
      ...summary,
    },
    null,
    2
  )
);
