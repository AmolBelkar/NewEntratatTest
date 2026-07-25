exports.analyze = (code) => {

    const result = {

        important_functions: "None",

        inputs: "None",

        outputs: "None",

        loops_or_conditions: "None"

    };

    /*
    |--------------------------------------------------------------------------
    | Functions
    |--------------------------------------------------------------------------
    */

    const functionRegexes = [

        /^\s*def\s+([a-zA-Z_]\w*)\s*\(/gm,

        /function\s+([a-zA-Z_$][\w$]*)\s*\(/g,

        /(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*\(/g,

        /\b(?:public|private|protected)?\s*(?:static\s+)?(?:void|int|double|float|boolean|char|String|bool|string|\w+)\s+([a-zA-Z_]\w*)\s*\(/g,

        /func\s+([a-zA-Z_]\w*)\s*\(/g

    ];

    const functions = [];

    functionRegexes.forEach(regex => {

        const matches = [...code.matchAll(regex)];

        matches.forEach(match => {

            if (match[1]) {

                functions.push(match[1]);

            }

        });

    });

    if (functions.length) {

        result.important_functions =
            [...new Set(functions)].join(", ");

    }

    /*
    |--------------------------------------------------------------------------
    | Inputs
    |--------------------------------------------------------------------------
    */

    const inputRegexes = [

        /\binput\s*\(/,

        /\bScanner\b/,

        /\bBufferedReader\b/,

        /\bprompt\s*\(/,

        /\bConsole\.ReadLine\b/,

        /\bcin\s*>>/,

        /\bscanf\s*\(/,

        /\bfmt\.Scan/,

        /\bprocess\.stdin/

    ];

    if (inputRegexes.some(regex => regex.test(code))) {

        result.inputs = "User input detected";

    }

    /*
    |--------------------------------------------------------------------------
    | Outputs
    |--------------------------------------------------------------------------
    */

    const outputRegexes = [

        /\bprint\s*\(/,

        /\bSystem\.out\.print/,

        /\bconsole\.log/,

        /\bConsole\.Write(Line)?/,

        /\bprintf\s*\(/,

        /\bcout\s*<</,

        /\bfmt\.Print/,

        /\becho\b/

    ];

    if (outputRegexes.some(regex => regex.test(code))) {

        result.outputs = "Printed to console";

    }

    /*
    |--------------------------------------------------------------------------
    | Loops / Conditions
    |--------------------------------------------------------------------------
    */

    const detected = [];

    if (/\bfor\b/.test(code))
        detected.push("for loop");

    if (/\bforeach\b/.test(code))
        detected.push("foreach loop");

    if (/\bwhile\b/.test(code))
        detected.push("while loop");

    if (/\bif\b/.test(code))
        detected.push("if condition");

    if (/\belif\b/.test(code))
        detected.push("elif condition");

    if (/\belse\b/.test(code))
        detected.push("else block");

    if (/\bswitch\b/.test(code))
        detected.push("switch statement");

    if (detected.length) {

        result.loops_or_conditions =
            [...new Set(detected)].join(", ");

    }

    return result;

};