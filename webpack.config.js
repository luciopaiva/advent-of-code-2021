
const {exec} = require("child_process");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

class RunnerPlugin {
    apply(compiler) {
        compiler.hooks.done.tap("RunnerPlugin", () => {
            console.info("=".repeat(80));
            const scriptRun = exec("node dist/main.js --enable-source-maps");
            scriptRun.stdout.pipe(process.stdout);
            scriptRun.stderr.pipe(process.stderr);
            const timer = setTimeout(() => {
                scriptRun.kill("SIGTERM");
                console.error("Script aborted due to time out.");
            }, 1000);
            let startTime;
            scriptRun.on("spawn", () => startTime = process.hrtime.bigint());
            scriptRun.on("exit", () => {
                const elapsed = process.hrtime.bigint() - startTime;
                const ms = elapsed / 1_000_000n;
                clearTimeout(timer);
                console.info(`Took ${ms} ms ` + "=".repeat(80));
            });
        });
    }
}

module.exports = {
    target: "node",
    mode: "development",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        sourceMapFilename: "[name].js.map"
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    transpileOnly: true,
                }
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new RunnerPlugin(),
    ],
    resolve: {
        extensions: [".js", ".ts"],
    },
    experiments: {
        topLevelAwait: true,
    },
    stats: "errors-only",
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};
