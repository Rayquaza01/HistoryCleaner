import Bundler from "parcel-bundler";

const entryFiles = ["src/**/*.html", "src/background.ts"];

const options = {
    outDir: "./dist",
    watch: true,
    cache: true,
    cacheDir: ".cache",
    minify: false,
    target: "browser",
    logLevel: 3,
    hmr: false,
    sourceMaps: true,
    detailedReport: false,
    autoInstall: false
};

export async function bundle(production: boolean): Promise<void> {
    if (production) {
        options.watch = false;
        options.detailedReport = true;
        options.minify = true;
    }

    const bundler = new Bundler(entryFiles, options);

    await bundler.bundle();
}
