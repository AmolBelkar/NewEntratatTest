# AI Code Explainer

A small web app that accepts one or more source code snippets (Java, Python, JavaScript, etc.), extracts structural information, generates a human-friendly explanation and complexity estimates, and suggests optimized code via an AI provider.

**Key features**
- Detects multiple snippets in a single paste and analyzes each.
- Uses lightweight AST + regex analysis to extract functions, inputs/outputs, loops/conditions.
- Calls an external AI service to produce a consolidated explanation and optimized code.
- Simple web UI for pasting code, viewing current analysis, and keeping a history of past analyses.

**Repository Structure**
- [src/app.js](src/app.js) : Express app wiring and static middleware.
- [src/server.js](src/server.js) : Server entrypoint (starts the app).
- [src/routes/codeRoutes.js](src/routes/codeRoutes.js) : API routes.
- [src/controllers/codeController.js](src/controllers/codeController.js) : Request validation and orchestration.
- [src/services/explanationService.js](src/services/explanationService.js) : Builds prompts, runs analyzers, and aggregates AI responses.
- [src/services/aiService.js](src/services/aiService.js) : Remote AI provider integration (HTTP client).
- [src/config/groqConfig.js](src/config/groqConfig.js) : Small config surface for API URL, model, and apiKey source.
- [src/utils/promptBuilder.js](src/utils/promptBuilder.js) : Creates AI prompts for explanation/optimization.
- [src/utils/responseValidator.js](src/utils/responseValidator.js) : Attempts to parse AI JSON responses.
- [src/utils/languageDetector.js](src/utils/languageDetector.js) : Splits input into one or more language snippets.
- [src/utils/codeAnalyzer.js](src/utils/codeAnalyzer.js) : Regex-based code analysis fallback.
- [src/utils/astAnalyzer.js](src/utils/astAnalyzer.js) : AST-based analysis for JavaScript using acorn.
- [src/public/index.html](src/public/index.html) : Single-page UI.
- [src/public/script.js](src/public/script.js) : Frontend interaction and rendering logic.
- [.env.example](.env.example) : Example environment variables (do not commit real keys).

**Project structure (detailed)**

```
ai-code-explainer
│
├── src
│   ├── app.js                 # Express app and middleware
│   ├── server.js              # Server entrypoint
│   ├── config
│   │   └── groqConfig.js      # API URL, model, apiKey source
│   ├── controllers
│   │   └── codeController.js  # Request validation + orchestration
│   ├── routes
│   │   └── codeRoutes.js      # API routes (POST /api/code/explain)
│   ├── services
│   │   ├── aiService.js            # HTTP client to AI provider
│   │   └── explanationService.js   # Prompt building + analysis orchestration
│   ├── utils
│   │   ├── astAnalyzer.js          # JavaScript AST-based analysis (acorn)
│   │   ├── codeAnalyzer.js         # Regex-based analysis fallback
│   │   ├── languageDetector.js     # Splits input into snippets by language
│   │   ├── promptBuilder.js        # Compose AI prompts
│   │   └── responseValidator.js    # Parse and validate AI responses
│   └── public
│       ├── index.html              # Frontend UI
│       ├── script.js               # Frontend logic and rendering
│       └── style.css               # UI styles
│
├── .env.example                    # Example environment variables
├── package.json                    # npm dependencies + scripts
└── README.md                       # This file
```

Prerequisites
- Node.js 18+ (LTS recommended).
- npm or yarn.
- An API key for the configured AI provider (set via environment variable).

Installation
1. Clone the repository and change into it:

```bash
git clone <repo-url>
cd ai-code-explainer
```

2. Install dependencies:

```bash
npm install
```

3. Create a local `.env` file (do NOT commit it). Use the example as a guide:

```text
PORT=3000
GROQ_API_KEY=your_api_key_here
# Optional tuning
AI_MAX_RETRIES=3
AI_BASE_DELAY_MS=1000
```

4. Start the server:

```bash
node src/server.js
```

The app will start on port 3000 by default. Open http://localhost:3000 in your browser.

Environment variables and configuration
- `GROQ_API_KEY` (required): The API key used by the AI provider. Set this locally in `.env` or as an environment variable.
- `PORT` (optional): HTTP port (default 3000).
- `AI_MAX_RETRIES` (optional): How many retry attempts the AI client will make for transient errors (default 3).
- `AI_BASE_DELAY_MS` (optional): Base delay (ms) used for exponential backoff (default 1000).

How the app works (overview)
1. The frontend posts code to `POST /api/code/explain` handled by [src/routes/codeRoutes.js](src/routes/codeRoutes.js).
2. `codeController.explainCode` validates input size, calls `detectSnippets` from [src/utils/languageDetector.js](src/utils/languageDetector.js), and forwards the code to [src/services/explanationService.js](src/services/explanationService.js).
3. `explanationService` runs local analyzers (`astAnalyzer` for JS and `codeAnalyzer` fallback) to extract structural metadata, then builds an AI prompt with [src/utils/promptBuilder.js](src/utils/promptBuilder.js).
4. The AI call is performed in [src/services/aiService.js](src/services/aiService.js). Responses are validated and parsed by [src/utils/responseValidator.js](src/utils/responseValidator.js) and returned to the frontend.
5. The frontend renders snippet cards, consolidated explanation, complexity, and a collapsible optimized code block.

**Explanation flow (UI → Backend → UI)**

Frontend flow
- User pastes one or more snippets into the editor (`#code` textarea) and clicks the `🚀 Explain Code` button (`#explainBtn`).
- `src/public/script.js` validates the input (non-empty), shows a loading state, and sends a `POST /api/code/explain` request with `{ code }` as JSON.
- While waiting, the UI displays an "Analyzing..." result card and disables the button to prevent duplicate requests.

Backend flow
- Express receives the POST at `src/routes/codeRoutes.js` and routes it to `codeController.explainCode`.
- `codeController` validates request size (max 10,000 chars) and presence, then calls `detectSnippets(code)` from `src/utils/languageDetector.js`.
- `languageDetector` splits the pasted text into one or more language-specific snippets (or a single `unknown` snippet when detection fails but input exists).
- For each snippet, `explanationService` runs static analysis:
  - If the snippet is JavaScript, `astAnalyzer.analyze` (Acorn) attempts AST-based extraction of functions, calls, loops and conditions.
  - If AST analysis isn't available or fails, `codeAnalyzer.analyze` runs regex-based extraction as a deterministic fallback.
- `explanationService` aggregates the per-snippet analyses and calls `promptBuilder.buildPrompt(code)` to create a constrained prompt for the AI.
- The prompt is sent to the remote AI client in `aiService` which performs the HTTP request to the configured provider (reads `GROQ_API_KEY` from env). The client returns the model output and may perform retries/backoff for transient errors.
- `responseValidator.parse` attempts to parse the AI response as JSON (removing ``` fences if present). If parsing fails, the raw text is returned as `explanation` and `optimizedCode` may be empty.
- `explanationService` returns the final payload:
  - `snippets`: array of per-snippet analyses (functions, inputs, outputs, loops/conditions)
  - `explanation`: consolidated AI-generated explanation
  - `optimizedCode`: AI-suggested code (string)
  - `complexity`: `{ time, space }` estimates when available

Frontend rendering
- The frontend receives the JSON and re-enables the explain button.
- `script.js` populates the Current Analysis area with one or more snippet cards, the AI Explanation, an optional Complexity card, and an Optimized Code card (if present).
- The result is also appended to the History list with a timestamp and the original code in a collapsible block.

Error handling and common responses
- 400: Sent when input is empty or exceeds max length; the UI surfaces the server error message.
- 429: If the AI provider rate-limits requests, `aiService` should surface a retry message or be configured to retry with exponential backoff. The frontend shows a friendly rate-limit message when received from the server.
- 500: Internal server errors (AI provider outages, unexpected exceptions) are returned to the client with a concise message and logged server-side for investigation.

API
- POST /api/code/explain
  - Request body: `{ "code": "<source code here>" }`
  - Response: JSON with `snippets` (analysis per snippet), `explanation` (AI text), `optimizedCode` (string), and `complexity` ({time, space}).

Frontend usage
- Paste one or more code snippets into the editor and click "🚀 Explain Code".
- The UI shows the current analysis and appends it to the history list.
- Click "📋 Copy Explanation" to copy the AI explanation text.

Error handling & troubleshooting
- 400 Invalid input: The server validates non-empty input and a maximum length (10,000 characters).
- Missing API key: The service will fail if `GROQ_API_KEY` is not set. Add it to `.env` or export it in your shell.
- Rate limits / 429: The AI provider can return 429. Set `AI_MAX_RETRIES` and `AI_BASE_DELAY_MS` to tune retry behavior, but if you consistently hit limits, rotate keys or consult the provider for quota increases.

Security
- Never commit `.env` or secrets. Use `.env.example` to show required variables.
- Rotate or revoke any API key that has been accidentally committed.
- Keep dependencies up to date and monitor transitive dependency advisories.

Development notes
- JavaScript snippet analysis uses `acorn` and [src/utils/astAnalyzer.js](src/utils/astAnalyzer.js) for better accuracy.
- The system falls back to regex-based analysis (`src/utils/codeAnalyzer.js`) when AST analysis is not available or fails.
- Prompts are assembled in [src/utils/promptBuilder.js](src/utils/promptBuilder.js). If you change prompt rules, test that the AI output remains JSON-parsable by [src/utils/responseValidator.js](src/utils/responseValidator.js).

Extending the app
- Add language-specific AST analyzers and register them in `explanationService`.
- Improve `languageDetector` patterns to better split multi-language inputs.
- Add caching for repeated requests to reduce AI usage and cost.

Troubleshooting tips
- If the frontend reports "Unable to connect to the server.", check the server console for errors and ensure the Node process is running.
- If AI responses are not valid JSON, check `promptBuilder` output and consider adding stricter response formatting in prompts.
- For persistent 429s, add longer backoff (`AI_BASE_DELAY_MS`) or contact your AI provider.

Contributing
- Fork, make changes, and open a pull request. Keep changes focused and add tests for new analyzers when possible.

License
- MIT
