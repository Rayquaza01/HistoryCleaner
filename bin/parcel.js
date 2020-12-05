"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundle = void 0;
const parcel_bundler_1 = __importDefault(require("parcel-bundler"));
const entryFiles = ["src/**/*.html", "background.ts"];
const options = {
    outDir: "./dist",
    watch: false,
    cache: true,
    cacheDir: ".cache",
    minify: false,
    target: "browser",
    logLevel: 3,
    hmr: false,
    sourceMaps: true,
    detailedReport: true,
    autoInstall: false
};
async function bundle(production) {
    if (production) {
        options.watch = false;
        options.detailedReport = true;
        options.minify = true;
    }
    else {
        options.watch = true;
        options.detailedReport = false,
            options.minify = false;
    }
    const bundler = new parcel_bundler_1.default(entryFiles, options);
    await bundler.bundle();
}
exports.bundle = bundle;
