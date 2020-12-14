"use strict";
const cpx = require("cpx");

const src = "src/**/*.{json,png}";
const dest = "dist";

/**
 * Copys assets to destination folder
 * @param {boolean} production
 */
module.exports = function assets(production) {
    if (production) {
        cpx.copySync(src, dest);
    } else {
        const watch  = cpx.watch(src, dest);
        watch.on("copy", (e) => console.log(e.srcPath, "copied to", e.dstPath));
    }
}
