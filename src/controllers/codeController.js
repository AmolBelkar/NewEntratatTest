const explanationService = require("../services/explanationService");
const { detectSnippets } = require("../utils/languageDetector");

const MAX_CODE_LENGTH = 10000;

exports.explainCode = async (req, res) => {

    try {

        const { code } = req.body;

        if (!code || !code.trim()) {

            return res.status(400).json({

                error: "Please paste some code."

            });

        }

        if (code.length > MAX_CODE_LENGTH) {

            return res.status(400).json({

                error: "Code is too large. Please limit your input to 10,000 characters."

            });

        }

        // Detect snippets only for validation
        const snippets = detectSnippets(code);

        if (!snippets.length) {

            return res.status(400).json({

                error: "No valid code snippets found."

            });

        }

        console.log({

            snippetCount: snippets.length,

            codeLength: code.length,

            timestamp: new Date().toISOString()

        });

        // Generate analysis and AI explanation
        const result = await explanationService.generateExplanation(code);

        return res.json(result);

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: error.message || "Internal Server Error"

        });

    }

};