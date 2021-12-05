
const fs = require("fs");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    target: "node",
    mode: "development",
    entry: () => {
        const files = fs.readdirSync("./src").filter(file => /^[0-9]{2}[a-z]/.test(file));
        return Object.fromEntries(files.map(file => [path.parse(file).name, `./src/${file}`]));
    },
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
    plugins: [new ForkTsCheckerWebpackPlugin()],
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
