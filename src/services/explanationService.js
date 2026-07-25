const aiService = require("./aiService");
const promptBuilder = require("../utils/promptBuilder");
const validator = require("../utils/responseValidator");

const analyzer = require("../utils/codeAnalyzer");
const astAnalyzer = require("../utils/astAnalyzer");

const { detectSnippets } = require("../utils/languageDetector");

exports.generateExplanation = async (code) => {

    // Detect snippets

    const snippets = detectSnippets(code);

    if (!snippets.length) {

        throw new Error("No supported code snippets found.");

    }

    /*
    |--------------------------------------------------------------------------
    | Analyze snippets
    | Prefer AST, fallback to Regex
    |--------------------------------------------------------------------------
    */

    const analyses = snippets.map(snippet => {

        let analysis = null;

        if (

            snippet.language === "javascript"

        ) {

            analysis = astAnalyzer.analyze(

                snippet.code

            );

        }

        if (!analysis) {

            analysis = analyzer.analyze(

                snippet.code

            );

        }

        return analysis;

    });

    /*
    |--------------------------------------------------------------------------
    | AI Explanation
    |--------------------------------------------------------------------------
    */

    const prompt = promptBuilder.buildPrompt(code);

    const aiResponse = await aiService.generate(prompt);

    if (!aiResponse || !aiResponse.trim()) {

        throw new Error(

            "AI returned an empty explanation."

        );

    }

    const parsed = validator.parse(aiResponse);

    return {

        snippets: analyses,

        explanation: parsed.explanation,

        optimizedCode: parsed.optimizedCode,

        complexity: parsed.complexity

    };

};