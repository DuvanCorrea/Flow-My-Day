#!/usr/bin/env node
import { run } from "../src/cli.js";
import { handleFatalError } from "../src/utils/errorHandler.js";
function onFatal(source) {
    return (reason) => {
        handleFatalError(reason, {
            source,
            argv: process.argv,
            cwd: process.cwd()
        });
        process.exit(1);
    };
}
process.on("uncaughtException", onFatal("uncaughtException"));
process.on("unhandledRejection", onFatal("unhandledRejection"));
try {
    run();
}
catch (error) {
    handleFatalError(error, {
        source: "topLevel",
        argv: process.argv,
        cwd: process.cwd()
    });
    process.exit(1);
}
