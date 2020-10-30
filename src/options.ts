import { browser } from "webextension-polyfill-ts";
import { ToggleButton } from "./ToggleButton";

let days: HTMLInputElement = document.querySelector("#days");
let notifications: HTMLSelectElement = document.querySelector("#notifications");

let notificationRequestButton: ToggleButton = new ToggleButton(
    document.querySelector("#notification-permission-request"),
    ["Request Notification Permission", "Revoke Notification Permission"]
)

function toggleButton(e: MouseEvent) {
    if (notificationRequestButton.getState === 0) {
        browser.permissions.request({ permissions: ["notifications"] })
            .then((request: boolean) => {
                if (request) {
                    notificationRequestButton.setState = 1;
                    notifications.disabled = false;
                    browser.notifications.create({
                        type: "basic",
                        title: "Notification Enabled!",
                        message: "You can now enable notifications for when history is deleted"
                    });
                } else {
                    notificationRequestButton.setState = 0;
                    notifications.value = "false";
                    notifications.disabled = true;
                    browser.storage.local.set({ notifications: false })
                }
            });
    } else if (notificationRequestButton.getState === 1) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.setState = 0;
        notifications.value = "false";
        notifications.disabled = true;
    }
}

function save(e: InputEvent) {
    // get options from page
    let obj = {
        days: days.value || 0,
        notifications: JSON.parse(notifications.value) || false
    }
    // save options
    browser.storage.local.set(obj);
}

async function load() {
    let res = await browser.storage.local.get();
    days.value = res.days;
    notifications.value = res.notifications;

    let permissions = await browser.permissions.getAll();
    if (permissions.permissions.includes("notifications")) {
        notifications.disabled = false;
        notificationRequestButton.setState = 1;
    } else {
        notifications.disabled = true;
        notificationRequestButton.setState = 0;
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement.addEventListener("click", toggleButton);
document.querySelector("#box").addEventListener("input", save);
