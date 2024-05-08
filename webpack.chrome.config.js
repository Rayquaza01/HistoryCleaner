/* eslint-disable */
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const copyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtrackPlugin = require("mini-css-extract-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        background: __dirname + "/src/background-chrome.ts",
        // options: __dirname + "/src/options.ts",
        popup: __dirname + "/src/popup.ts"
    },
    devtool: "source-map",
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtrackPlugin.loader, "css-loader"]
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtrackPlugin(),
        // new HtmlWebpackPlugin({
        //     template: "src/options.html",
        //     filename: "options.html",
        //     chunks: ["options"],
        // }),
        new HtmlWebpackPlugin({
            template: "src/popup.html",
            filename: "popup.html",
            chunks: ["popup"],
        }),
        new copyWebpackPlugin({
            patterns: [
                { from: "src/manifest-chrome.json", to: "manifest.json" },
                {
                    from: "src/icons/",
                    to: "icons",
                    toType: "dir"
                },
                {
                    from: "src/_locales/",
                    to: "_locales",
                    toType: "dir"
                },
                { from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js" },
                { from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map" }
            ]
        })
    ],
    externals: {
        "webextension-polyfill": "browser"
    },
    optimization: {
        usedExports: true,
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
}
