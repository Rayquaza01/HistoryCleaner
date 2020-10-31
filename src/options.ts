import { browser } from "webextension-polyfill-ts";
import { ToggleButton } from "./ToggleButton";
import { MessageInterface } from "./MessageInterface";

let days: HTMLInputElement = document.querySelector("#days");
let idleLength: HTMLInputElement = document.querySelector("#idleLength");
let deleteMode: HTMLSelectElement = document.querySelector("#deleteMode");
let notifications: HTMLSelectElement = document.querySelector("#notifications");

let uploadButton: HTMLButtonElement = document.querySelector("#syncUp");
let downloadButton: HTMLButtonElement = document.querySelector("#syncDown");

let notificationRequestButton: ToggleButton = new ToggleButton(
    document.querySelector("#notification-permission-request"),
    ["Request Notification Permission", "Revoke Notification Permission"]
)
let manualDeleteButton: HTMLButtonElement = document.querySelector("#manual-delete");

function manualDelete(): void {
    let msg: MessageInterface = {
        state: "delete"
    };
    browser.runtime.sendMessage(msg);
}

function togglePermission(e: MouseEvent): void {
    // if permission is not currently granted
    if (notificationRequestButton.state === 0) {
        // attempt to get permission
        browser.permissions.request({ permissions: ["notifications"] })
            .then((request: boolean) => {
                // if user gives permission
                // switch button state, enable option, send demo notification
                if (request) {
                    notificationRequestButton.state = 1;
                    notifications.disabled = false;
                }
                // otherwise, keep button state same, turn off notifications, disable option
                else {
                    notificationRequestButton.state = 0;
                    notifications.value = "false";
                    notifications.disabled = true;
                    browser.storage.local.set({ notifications: false })
                }
            });
    }
    // if permission currently granted
    // revoke permission, switch button state, disable notifications, and disable option
    else if (notificationRequestButton.state === 1) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.state = 0;
        notifications.value = "false";
        notifications.disabled = true;
        browser.storage.local.set({ notifications: false })
    }
}

async function upload(): Promise<void> {
    let res = await browser.storage.local.get();
    await browser.storage.sync.set(res);
    location.reload();
}

async function download(): Promise<void> {
    let res = await browser.storage.sync.get();

    // set delete mode from sync get
    let msg: MessageInterface = { state: null }
    if (res.deleteMode === "idle") {
        msg.state = "setidle"
        msg.data = res.idleLength
        browser.runtime.sendMessage(msg);
    } else if (res.deleteMode === "startup") {
        msg.state = "setstartup";
        browser.runtime.sendMessage(msg);
    }

    // disable notifications if permission not allowed
    if (notificationRequestButton.state === 0) {
        res.notifications = false;
    }

    await browser.storage.local.set(res);
    location.reload();
}

function save(e: InputEvent): void {
    // get options from page
    let obj: any = {
        days: Number(days.value) || 0,
        idleLength: Number(idleLength.value) || 60,
        deleteMode: deleteMode.value || "idle",
        notifications: JSON.parse(notifications.value) || false,
    }
    if (obj.notifications && e.target === notifications) {
        browser.notifications.create({
            type: "basic",
            title: "Notification Enabled!",
            message: "Notifications will now appear when history is deleted!"
        });
    }

    if (e.target === idleLength && obj.deleteMode === "idle") {
        let msg: MessageInterface = {
            state: "setidle",
            data: obj.idleLength
        };
        browser.runtime.sendMessage(msg);
    } else if (e.target === deleteMode) {
        let msg: MessageInterface = { state: null };
        if (obj.deleteMode === "idle") {
            msg.state = "setidle";
            msg.data = obj.idleLength;
        } else {
            msg.state = "setstartup";
        }
        browser.runtime.sendMessage(msg);
    }
    // save options
    browser.storage.local.set(obj);
}

async function load(): Promise<void> {
    let res = await browser.storage.local.get();
    days.value = res.days;
    idleLength.value = res.idleLength;
    deleteMode.value = res.deleteMode;
    notifications.value = res.notifications;

    // check permissions
    let permissions = await browser.permissions.getAll();
    // if notification permission
    // enable notification option, set button to revoke
    if (permissions.permissions.includes("notifications")) {
        notifications.disabled = false;
        notificationRequestButton.state = 1;
    }
    // otherise disable option, set button to enable
    else {
        notifications.disabled = true;
        notificationRequestButton.state = 0;
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement.addEventListener("click", togglePermission);
document.querySelector("#box").addEventListener("change", save);
manualDeleteButton.addEventListener("click", manualDelete);

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);
