const axios = require("axios");
const groqConfig = require("../config/groqConfig");

exports.generate = async (prompt) => {

    try {

        const response = await axios.post(

            groqConfig.apiUrl,

            {

                model: groqConfig.model,

                messages: [

                    {

                        role: "user",

                        content: prompt

                    }

                ],

                temperature: 0.2

            },

            {

                headers: {

                    Authorization:
                        `Bearer ${groqConfig.apiKey}`,

                    "Content-Type":
                        "application/json"

                }

            }

        );

        return response.data.choices[0].message.content;

    }

    catch (error) {

        console.error(
            "AI Error:",
            error.response?.data || error.message
        );

        if (error.response) {

            switch (error.response.status) {

                case 400:

                    throw new Error(
                        "Invalid request sent to the AI service."
                    );

                case 401:

                    throw new Error(
                        "Invalid AI API key."
                    );

                case 429:

                    throw new Error(
                        "AI rate limit exceeded. Please try again later."
                    );

                case 500:

                    throw new Error(
                        "The AI provider is temporarily unavailable."
                    );

                default:

                    throw new Error(
                        "AI service failed."
                    );

            }

        }

        throw new Error(
            "Unable to connect to the AI service."
        );

    }

};