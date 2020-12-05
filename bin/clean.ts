import mkdir from "make-dir";
import del from "del";

async function main(): Promise<void> {
    await mkdir("dist");
    await del("dist/*");
}

main();
