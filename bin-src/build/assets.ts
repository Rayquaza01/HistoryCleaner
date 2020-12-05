import cpx from "cpx";

const src = "src/**/*.{json,png}";
const dest = "dist";

export function assets(production: boolean): void {
    if (production) {
        cpx.copySync(src, dest);
    } else {
        const watch  = cpx.watch(src, dest);
        watch.on("copy", (e) => console.log(e.srcPath, "copied to", e.dstPath));
    }
}
