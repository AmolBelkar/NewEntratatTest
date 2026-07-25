const acorn = require("acorn");
const walk = require("acorn-walk");

exports.analyze = (code) => {

    const result = {

        important_functions: "None",

        inputs: "None",

        outputs: "None",

        loops_or_conditions: "None"

    };

    try {

        const ast = acorn.parse(code, {

            ecmaVersion: "latest",

            sourceType: "module",

            allowHashBang: true

        });

        const functions = new Set();

        const loops = new Set();

        let inputDetected = false;

        let outputDetected = false;

        walk.simple(ast, {

            /*
            |--------------------------------------------------------------------------
            | Function Declarations
            |--------------------------------------------------------------------------
            */

            FunctionDeclaration(node) {

                if (node.id && node.id.name) {

                    functions.add(node.id.name);

                }

            },

            /*
            |--------------------------------------------------------------------------
            | Arrow / Function Expressions
            |--------------------------------------------------------------------------
            */

            VariableDeclarator(node) {

                if (

                    node.init &&

                    (

                        node.init.type === "ArrowFunctionExpression" ||

                        node.init.type === "FunctionExpression"

                    )

                ) {

                    functions.add(node.id.name);

                }

            },

            /*
            |--------------------------------------------------------------------------
            | Function Calls
            |--------------------------------------------------------------------------
            */

            CallExpression(node) {

                const callee = node.callee;

                if (

                    callee.type === "Identifier"

                ) {

                    if (

                        ["prompt", "input"].includes(callee.name)

                    ) {

                        inputDetected = true;

                    }

                    if (

                        ["print", "println"].includes(callee.name)

                    ) {

                        outputDetected = true;

                    }

                }

                if (

                    callee.type === "MemberExpression"

                ) {

                    const object = callee.object;

                    const property = callee.property;

                    // console.log(...)
                    if (

                        object.type === "Identifier" &&

                        object.name === "console" &&

                        property.name === "log"

                    ) {

                        outputDetected = true;

                    }

                    // System.out.print(...)
                    if (

                        object.type === "MemberExpression" &&

                        object.object.name === "System" &&

                        object.property.name === "out"

                    ) {

                        outputDetected = true;

                    }

                }

            },

            /*
            |--------------------------------------------------------------------------
            | Loops
            |--------------------------------------------------------------------------
            */

            ForStatement() {

                loops.add("for loop");

            },

            ForInStatement() {

                loops.add("for-in loop");

            },

            ForOfStatement() {

                loops.add("for-of loop");

            },

            WhileStatement() {

                loops.add("while loop");

            },

            DoWhileStatement() {

                loops.add("do-while loop");

            },

            /*
            |--------------------------------------------------------------------------
            | Conditions
            |--------------------------------------------------------------------------
            */

            IfStatement() {

                loops.add("if condition");

            },

            SwitchStatement() {

                loops.add("switch statement");

            }

        });

        if (functions.size) {

            result.important_functions =

                [...functions].join(", ");

        }

        if (inputDetected) {

            result.inputs = "User input detected";

        }

        if (outputDetected) {

            result.outputs = "Printed to console";

        }

        if (loops.size) {

            result.loops_or_conditions =

                [...loops].join(", ");

        }

        return result;

    }

    catch (error) {

        return null;

    }

};