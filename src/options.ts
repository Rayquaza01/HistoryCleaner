import { browser } from "webextension-polyfill-ts";
import { ToggleButton } from "./ToggleButton";

let days: HTMLInputElement = document.querySelector("#days");
let notifications: HTMLSelectElement = document.querySelector("#notifications");

let notificationRequestButton: ToggleButton = new ToggleButton(
    document.querySelector("#notification-permission-request"),
    ["Request Notification Permission", "Revoke Notification Permission"]
)
let manualDeleteButton: HTMLButtonElement = document.querySelector("#manual-delete");

function manualDelete() {
    browser.runtime.sendMessage("{a138007c-5ff6-4d10-83d9-0afaf0efbe5e}", "idle");
}

function togglePermission(e: MouseEvent): void {
    // if permission is not currently granted
    if (notificationRequestButton.getState === 0) {
        // attempt to get permission
        browser.permissions.request({ permissions: ["notifications"] })
            .then((request: boolean) => {
                // if user gives permission
                // switch button state, enable option, send demo notification
                if (request) {
                    notificationRequestButton.setState = 1;
                    notifications.disabled = false;
                    browser.notifications.create({
                        type: "basic",
                        title: "Notification Enabled!",
                        message: "You can now enable notifications for when history is deleted"
                    });
                }
                // otherwise, keep button state same, turn off notifications, disable option
                else {
                    notificationRequestButton.setState = 0;
                    notifications.value = "false";
                    notifications.disabled = true;
                    browser.storage.local.set({ notifications: false })
                }
            });
    }
    // if permission currently granted
    // revoke permission, switch button state, disable notifications, and disable option
    else if (notificationRequestButton.getState === 1) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.setState = 0;
        notifications.value = "false";
        notifications.disabled = true;
        browser.storage.local.set({ notifications: false })
    }
}

function save(e: InputEvent): void {
    // get options from page
    let obj = {
        days: days.value || 0,
        notifications: JSON.parse(notifications.value) || false
    }
    // save options
    browser.storage.local.set(obj);
}

async function load(): Promise<void> {
    let res = await browser.storage.local.get();
    days.value = res.days;
    notifications.value = res.notifications;

    // check permissions
    let permissions = await browser.permissions.getAll();
    // if notification permission
    // enable notification option, set button to revoke
    if (permissions.permissions.includes("notifications")) {
        notifications.disabled = false;
        notificationRequestButton.setState = 1;
    }
    // otherise disable option, set button to enable
    else {
        notifications.disabled = true;
        notificationRequestButton.setState = 0;
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement.addEventListener("click", togglePermission);
document.querySelector("#box").addEventListener("input", save);
manualDeleteButton.addEventListener("click", manualDelete);
