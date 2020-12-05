import Bundler from "parcel-bundler";

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

export async function bundle(production: boolean): Promise<void> {
    if (production) {
        options.watch = false;
        options.detailedReport = true;
        options.minify = true;
    } else {
        options.watch = true;
        options.detailedReport = false,
        options.minify = false;
    }

    const bundler = new Bundler(entryFiles, options);

    await bundler.bundle();
}
