const code = document.getElementById("code");
const explainBtn = document.getElementById("explainBtn");
const output = document.getElementById("output");
const historyContainer = document.getElementById("historyContainer");
const snippetCounter = document.getElementById("snippetCount");
const copyBtn = document.getElementById("copyExplanation");

let analysisCount = 0;
let latestExplanation = "";

/*
|--------------------------------------------------------------------------
| Escape HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(text = "") {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}

/*
|--------------------------------------------------------------------------
| Copy Explanation
|--------------------------------------------------------------------------
*/

copyBtn.addEventListener("click", async () => {

    if (!latestExplanation) {

        alert("No explanation available.");

        return;

    }

    await navigator.clipboard.writeText(latestExplanation);

    copyBtn.innerHTML = "✅ Copied";

    setTimeout(() => {

        copyBtn.innerHTML = "📋 Copy Explanation";

    }, 1500);

});

/*
|--------------------------------------------------------------------------
| Explain Code
|--------------------------------------------------------------------------
*/

explainBtn.addEventListener("click", async () => {

    if (!code.value.trim()) {

        alert("Please paste some code.");

        return;

    }

    explainBtn.disabled = true;

    explainBtn.innerHTML = "⏳ Analyzing...";

    output.innerHTML = `
        <div class="result-card">
            <h2>Analyzing...</h2>
            <p>Please wait while AI analyzes your code...</p>
        </div>
    `;

    try {

        const response = await fetch("/api/code/explain", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                code: code.value

            })

        });

        const data = await response.json();

        explainBtn.disabled = false;

        explainBtn.innerHTML = "🚀 Explain Code";

        if (!response.ok) {

            output.innerHTML = `
                <div class="result-card">
                    <h2>⚠️ Error</h2>
                    <p>${data.error}</p>
                </div>
            `;

            return;

        }

        latestExplanation = data.explanation || "";

        /*
        |--------------------------------------------------------------------------
        | Snippet Cards
        |--------------------------------------------------------------------------
        */

        let snippetCards = "";

        (data.snippets || []).forEach((snippet, index) => {

            snippetCards += `

                <div class="result-card">

                    <h2>Snippet Analysis</h2>

                    <div class="info-grid">

                        <div>

                            <h3>⚙️ Functions</h3>

                            <p>${snippet.important_functions || "None"}</p>

                        </div>

                        <div>

                            <h3>📥 Inputs</h3>

                            <p>${snippet.inputs || "None"}</p>

                        </div>

                        <div>

                            <h3>📤 Outputs</h3>

                            <p>${snippet.outputs || "None"}</p>

                        </div>

                        <div>

                            <h3>🔁 Loops / Conditions</h3>

                            <p>${snippet.loops_or_conditions || "None"}</p>

                        </div>

                    </div>

                </div>

            `;

        });

        /*
        |--------------------------------------------------------------------------
        | Optional Complexity Card (Bonus)
        |--------------------------------------------------------------------------
        */

        let complexityCard = "";

        if (data.complexity) {

            complexityCard = `

                <div class="result-card">

                    <h2>📈 Complexity</h2>

                    <p><strong>Time:</strong> ${data.complexity.time || "Unknown"}</p>

                    <p><strong>Space:</strong> ${data.complexity.space || "Unknown"}</p>

                </div>

            `;

        }

        /*
        |--------------------------------------------------------------------------
        | Optional Optimized Code Card (Bonus)
        |--------------------------------------------------------------------------
        */

        let optimizedCard = "";

        if (data.optimized_code) {

            optimizedCard = `

                <div class="result-card">

                    <h2>⚡ AI Suggested Optimization</h2>

                    <pre><code>${escapeHtml(data.optimized_code)}</code></pre>

                </div>

            `;

        }

        output.innerHTML = `


            ${snippetCards}

            <div class="result-card">

                <div class="explanation">

                    <h2>✨ AI Explanation</h2>

                    <p>${data.explanation}</p>

                </div>

            </div>

            ${complexityCard}

            ${optimizedCard}

        `;

        /*
        |--------------------------------------------------------------------------
        | History
        |--------------------------------------------------------------------------
        */

        analysisCount++;

        snippetCounter.textContent = analysisCount;

        if (analysisCount === 1) {

            historyContainer.innerHTML = "";

        }

        const timestamp = new Date().toLocaleString();

        let historyHtml = `

            <div class="history-card">

                <h3>Analysis #${analysisCount}</h3>

                <p class="history-time">

                    🕒 ${timestamp}

                </p>

                <details>

                    <summary>

                        📄 View Original Code

                    </summary>

                    <pre><code>${escapeHtml(code.value)}</code></pre>

                </details>

        `;

        (data.snippets || []).forEach((snippet, index) => {

            historyHtml += `

                <hr>

                <h4>Snippet Analysis</h4>

                <p>

                    <strong>Functions:</strong>

                    ${snippet.important_functions || "None"}

                </p>

                <p>

                    <strong>Inputs:</strong>

                    ${snippet.inputs || "None"}

                </p>

                <p>

                    <strong>Outputs:</strong>

                    ${snippet.outputs || "None"}

                </p>

                <p>

                    <strong>Loops / Conditions:</strong>

                    ${snippet.loops_or_conditions || "None"}

                </p>

            `;

        });

        historyHtml += `

            <hr>

            <h4>✨ AI Explanation</h4>

            <p>${data.explanation}</p>

        `;

        if (data.complexity) {

            historyHtml += `

                <p>

                    <strong>Time Complexity:</strong>

                    ${data.complexity.time || "Unknown"}

                </p>

                <p>

                    <strong>Space Complexity:</strong>

                    ${data.complexity.space || "Unknown"}

                </p>

            `;

        }

        if (data.optimized_code) {

            historyHtml += `

                <details>

                    <summary>

                        ⚡ Optimized Code

                    </summary>

                    <pre><code>${escapeHtml(data.optimized_code)}</code></pre>

                </details>

            `;

        }

        historyHtml += `

            </div>

        `;

        historyContainer.insertAdjacentHTML(

            "afterbegin",

            historyHtml

        );

        // Keep code in editor
        // code.value = "";

    }

    catch (err) {

        explainBtn.disabled = false;

        explainBtn.innerHTML = "🚀 Explain Code";

        output.innerHTML = `

            <div class="result-card">

                <h2>⚠️ Error</h2>

                <p>Unable to connect to the server.</p>

            </div>

        `;

    }

});

/*
|--------------------------------------------------------------------------
| Clear History
|--------------------------------------------------------------------------
*/

document
    .getElementById("clearHistory")
    .addEventListener("click", () => {

        analysisCount = 0;

        latestExplanation = "";

        snippetCounter.textContent = "0";

        historyContainer.innerHTML = `

            <div class="history-empty">

                No snippets analyzed yet.

            </div>

        `;

    });