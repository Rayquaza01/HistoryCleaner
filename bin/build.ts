import { clean } from "./clean";
import { bundle } from "./parcel";
import { assets } from "./assets";

async function main(): Promise<void> {
    const prod = process.argv[2] === "prod";

    console.log("Cleaning...");
    await clean();
    console.log("Copying assets...");
    await assets(prod);
    console.log("Building bundle...");
    await bundle(prod);
}

main();
