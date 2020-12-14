"use strict";
const clean = require("./clean");
const bundle = require("./bundle");
const assets = require("./assets");

async function main() {
    process.env.NODE_ENV = process.argv[2];
    const prod = process.argv[2] === "production";

    console.log("Cleaning...");
    await clean();
    console.log("Copying assets...");
    assets(prod);
    console.log("Building bundle...");
    await bundle(prod);
}

main();
