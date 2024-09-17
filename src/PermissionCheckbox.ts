import browser from "./we";
import { Manifest } from "webextension-polyfill";

export async function PermissionCheckbox(permissions: Manifest.OptionalPermission[], e: Event, save: () => void) {
    const target = e.target as HTMLInputElement;

    // if the user checked the box, make sure permission is granted first
    if (target.checked) {
        // prevent default stops the form listener from saving until *after* permission is granted
        e.preventDefault();

        const granted = await browser.permissions.request({ permissions });
        target.checked = granted;

        // I don't really like this.
        // because we prevent default, the checkbox never triggers the save function
        // but if we don't prevent default, it saves the wrong value!
        // as a fix, we manually call the save function once we know if the permission was granted
        save();
    }
}
