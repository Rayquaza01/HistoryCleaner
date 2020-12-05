import { clean } from "./clean";
import { bundle } from "./bundle";
import { assets } from "./assets";

const VERSION = 1;

async function main(): Promise<void> {
    process.env.NODE_ENV = process.argv[2];
    const prod = process.argv[2] === "production";

    const runVersion = parseInt(process.argv[3]);
    if (runVersion !== VERSION) {
        console.warn("Version mismatch!");
        console.warn(`Expected ${VERSION}, got ${runVersion}`);
        console.warn("You may need to rebuild rebuild the buildscript!");
        console.warn("npm run build:buildscript");
        console.log("");
    }

    console.log("Cleaning...");
    await clean();
    console.log("Copying assets...");
    assets(prod);
    console.log("Building bundle...");
    await bundle(prod);
}

main();
