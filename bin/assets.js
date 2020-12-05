"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assets = void 0;
const cpx_1 = __importDefault(require("cpx"));
const src = "src/**/*.{json,png}";
const dest = "dist";
async function assets(production) {
    if (production) {
        cpx_1.default.copySync(src, dest);
    }
    else {
        const watch = cpx_1.default.watch(src, dest);
        watch.on("copy", (e) => console.log(e.srcPath, "copied to", e.dstPath));
    }
}
exports.assets = assets;
