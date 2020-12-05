import mkdir from "make-dir";
import del from "del";

export async function clean(): Promise<void> {
    await mkdir("dist");
    await del("dist/*");
}
