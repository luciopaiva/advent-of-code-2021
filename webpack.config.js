
const {exec} = require("child_process");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const {clearTimeout} = require("timers");

class RunnerPlugin {
    apply(compiler) {
        compiler.hooks.done.tap("RunnerPlugin", () => {
            console.info("=".repeat(80));
            const scriptRun = exec("node ./dist/main.js");
            scriptRun.stdout.pipe(process.stdout);
            scriptRun.stderr.pipe(process.stderr);
            const timer = setTimeout(() => {
                scriptRun.kill("SIGTERM");
                console.error("Script aborted due to time out.");
            }, 1000);
            scriptRun.on("exit", () => {
                clearTimeout(timer);
                console.info("=".repeat(80));
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
