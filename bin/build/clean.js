"use strict";
const mkdir = require("make-dir");
const del = require("del");

module.exports = async function clean() {
    await mkdir("dist");
    await del("dist/*");
}
