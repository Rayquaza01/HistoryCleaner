"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = void 0;
const make_dir_1 = __importDefault(require("make-dir"));
const del_1 = __importDefault(require("del"));
async function clean() {
    await make_dir_1.default("dist");
    await del_1.default("dist/*");
}
exports.clean = clean;
