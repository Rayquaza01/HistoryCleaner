import browser from "./we";
import { Manifest } from "webextension-polyfill";

export async function PermissionCheckbox(permissions: Manifest.OptionalPermission[], targetCheckbox: HTMLInputElement, e: Event) {
    const target = e.target as HTMLInputElement;
    e.preventDefault();
    e.stopPropagation();

    const granted = await browser.permissions.request({ permissions });
    if (granted) {
        console.log("granted");
        targetCheckbox.checked = target.checked;
    } else {
        console.log("not granted");
        target.checked = false;
        targetCheckbox.checked = false;
    }

    targetCheckbox.dispatchEvent(new Event("input", { bubbles: true }));
}
