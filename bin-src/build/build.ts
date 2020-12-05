import { clean } from "./clean";
import { bundle } from "./bundle";
import { assets } from "./assets";

async function main(): Promise<void> {
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
