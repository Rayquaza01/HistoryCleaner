"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clean_1 = require("./clean");
const parcel_1 = require("./parcel");
const assets_1 = require("./assets");
async function main() {
    const prod = process.argv[2] === "prod";
    console.log("Cleaning...");
    await clean_1.clean();
    console.log("Copying assets...");
    await assets_1.assets(prod);
    console.log("Building bundle...");
    await parcel_1.bundle(prod);
}
main();
