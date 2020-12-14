const Bundler = require("parcel-bundler");

const entryFiles = ["src/**/*.html", "src/background.ts"];

const options = {
    watch: true,
    target: "browser",
    hmr: false,
    detailedReport: false,
    autoInstall: false
};

/**
 * Bundles assets
 * @param {boolean} production
 */
module.exports = async function bundle(production) {
    if (production) {
        options.watch = false;
        options.detailedReport = true;
    }

    const bundler = new Bundler(entryFiles, options);

    await bundler.bundle();
}
