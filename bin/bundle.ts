import Bundler from "parcel-bundler";

const entryFiles = ["src/**/*.html", "src/background.ts"];

const options = {
    watch: true,
    target: "browser",
    hmr: false,
    detailedReport: false,
    autoInstall: false
};

export async function bundle(production: boolean): Promise<void> {
    if (production) {
        options.watch = false;
        options.detailedReport = true;
    }

    const bundler = new Bundler(entryFiles, options);

    await bundler.bundle();
}
