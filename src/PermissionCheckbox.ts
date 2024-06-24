import browser from "./we";
import { Manifest } from "webextension-polyfill";

export async function PermissionCheckbox(permissions: Manifest.OptionalPermission[], e: Event) {
    const target = e.target as HTMLInputElement;
    e.preventDefault();

    const granted = await browser.permissions.request({ permissions });
    if (granted) {
        console.log("granted");
        target.checked = !target.checked;
    } else {
        target.checked = false;
    }
}
