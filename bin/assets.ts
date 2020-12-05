import cpx from "cpx";

const src = "src/**/*.{json,png}";
const dest = "dist";

export async function assets(production: boolean): Promise<void> {
    if (production) {
        cpx.copySync(src, dest);
    } else {
        const watch  = cpx.watch(src, dest);
        watch.on("copy", (e) => console.log(e.srcPath, "copied to", e.dstPath));
    }
}
