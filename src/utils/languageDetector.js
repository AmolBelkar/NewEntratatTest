/*
|--------------------------------------------------------------------------
| Language Patterns
|--------------------------------------------------------------------------
*/

const languages = [

    {
        language: "java",
        start: /^\s*(import\s+java\..*|public\s+class\s+\w+)/gm
    },

    {
        language: "python",
        start: /^\s*(def\s+\w+\s*\(|class\s+\w+|from\s+\w+\s+import|import\s+\w+)/gm
    },

    {
        language: "javascript",
        start: /^\s*(function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)/gm
    },

    {
        language: "typescript",
        start: /^\s*(interface\s+\w+|enum\s+\w+)/gm
    },

    {
        language: "php",
        start: /^\s*<\?php/gm
    },

    {
        language: "cpp",
        start: /^\s*#include\s*<iostream>/gm
    },

    {
        language: "c",
        start: /^\s*#include\s*<stdio\.h>/gm
    },

    {
        language: "go",
        start: /^\s*(package\s+main|func\s+\w+\s*\()/gm
    },

    {
        language: "csharp",
        start: /^\s*(using\s+System|namespace\s+\w+)/gm
    }

];

/*
|--------------------------------------------------------------------------
| Detect Single Language
|--------------------------------------------------------------------------
*/

exports.detectLanguage = (code) => {

    const snippets = exports.detectSnippets(code);

    return snippets.length
        ? snippets[0].language
        : "unknown";

};

/*
|--------------------------------------------------------------------------
| Detect Multiple Snippets
|--------------------------------------------------------------------------
*/

exports.detectSnippets = (code) => {

    const lines = code.split(/\r?\n/);

    const snippets = [];

    let currentLanguage = null;
    let currentLines = [];

    function detectLineLanguage(line) {

        const text = line.trim();

        if (!text)
            return null;

        // Java
        if (
            /^import\s+java\./.test(text) ||
            /^public\s+class\b/.test(text) ||
            /^public\s+static\s+void\s+main/
        ) {
            return "java";
        }

        // Python
        if (
            /^def\s+\w+\(/.test(text) ||
            /^class\s+\w+/.test(text) ||
            /^from\s+\w+\s+import/.test(text) ||
            /^import\s+\w+/.test(text) ||
            /^if\s+.*:/.test(text) ||
            /^elif\s+.*:/.test(text) ||
            /^else:/.test(text) ||
            /^for\s+.*:/.test(text) ||
            /^while\s+.*:/.test(text) ||
            /^\w+\s*=/.test(text)
        ) {
            return "python";
        }

        // JavaScript
        if (
            /^function\s+\w+\(/.test(text) ||
            /^const\s+/.test(text) ||
            /^let\s+/.test(text) ||
            /^var\s+/.test(text)
        ) {
            return "javascript";
        }

        // PHP
        if (/^<\?php/.test(text))
            return "php";

        // C++
        if (/^#include\s*<iostream>/.test(text))
            return "cpp";

        // C
        if (/^#include\s*<stdio\.h>/.test(text))
            return "c";

        // Go
        if (/^package\s+main/.test(text))
            return "go";

        // C#
        if (/^using\s+System/.test(text))
            return "csharp";

        return null;
    }

    for (const line of lines) {

        const detected = detectLineLanguage(line);

        if (detected && detected !== currentLanguage) {

            if (currentLines.length) {

                snippets.push({
                    language: currentLanguage,
                    code: currentLines.join("\n").trim()
                });

            }

            currentLanguage = detected;
            currentLines = [];
        }

        if (currentLanguage) {

            currentLines.push(line);

        }

    }

    if (currentLines.length) {

        snippets.push({
            language: currentLanguage,
            code: currentLines.join("\n").trim()
        });

    }

    return snippets;

};