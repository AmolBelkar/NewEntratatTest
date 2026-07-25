exports.parse = (response) => {

    try {

        const cleaned = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        return {

            explanation: parsed.explanation || "",

            optimizedCode: parsed.optimizedCode || "",

            complexity: parsed.complexity || {

                time: "Unknown",

                space: "Unknown"

            }

        };

    }

    catch (error) {

        // Fallback if AI doesn't return valid JSON

        return {

            explanation: response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim(),

            optimizedCode: "",

            complexity: {

                time: "Unknown",

                space: "Unknown"

            }

        };

    }

};