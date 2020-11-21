import { browser } from "webextension-polyfill-ts";
import { ToggleButton, ToggleButtonState } from "./ToggleButton";
import { MessageInterface, MessageState } from "./MessageInterface";
import { i18n } from "./i18n";
import { OptionsInterface } from "./OptionsInterface";

// Input elements
let days: HTMLInputElement = document.querySelector("#days");
let idleLength: HTMLInputElement = document.querySelector("#idleLength");
let deleteMode: HTMLSelectElement = document.querySelector("#deleteMode");
let notifications: HTMLSelectElement = document.querySelector("#notifications");

// parent to input elements
let box: HTMLDivElement = document.querySelector("#box");

// sync buttons
let uploadButton: HTMLButtonElement = document.querySelector("#syncUp");
let downloadButton: HTMLButtonElement = document.querySelector("#syncDown");

// permission toggle button
let notificationRequestButton: ToggleButton = new ToggleButton(
    document.querySelector("#notification-permission-request"),
    [browser.i18n.getMessage("notificationRequest"), browser.i18n.getMessage("notificationRevoke")]
)

// manual delete button
let manualDeleteButton: HTMLButtonElement = document.querySelector("#manual-delete");

/**
 * Sends a message to the background script telling it to delete the
 */
function manualDelete(): void {
    let msg: MessageInterface = {
        state: MessageState.DELETE
    };
    browser.runtime.sendMessage(msg);
}

function togglePermission(e: MouseEvent): void {
    // if permission is not currently granted
    if (notificationRequestButton.getState() === ToggleButtonState.NO_PERMISSION) {
        // attempt to get permission
        browser.permissions.request({ permissions: ["notifications"] })
            .then((request: boolean) => {
                // if user gives permission
                // switch button state, enable option, send demo notification
                if (request) {
                    notificationRequestButton.setState(ToggleButtonState.PERMISSION);
                    notifications.disabled = false;
                }
                // otherwise, keep button state same, turn off notifications, disable option
                else {
                    notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
                    notifications.value = "false";
                    notifications.disabled = true;
                    browser.storage.local.set({ notifications: false })
                }
            });
    }
    // if permission currently granted
    // revoke permission, switch button state, disable notifications, and disable option
    else if (notificationRequestButton.getState() === ToggleButtonState.PERMISSION) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
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
        msg.state = MessageState.SET_IDLE;
        msg.data = res.idleLength;
        browser.runtime.sendMessage(msg);
    } else if (res.deleteMode === "startup") {
        msg.state = MessageState.SET_STARTUP;
        browser.runtime.sendMessage(msg);
    }

    // disable notifications if permission not allowed
    if (notificationRequestButton.getState() === 0) {
        res.notifications = false;
    }

    await browser.storage.local.set(res);
    location.reload();
}

function save(e: InputEvent): void {
    // if options are valid
    let obj: OptionsInterface = {};
    if (days.validity.valid) {
        obj.days = Number(days.value);
    }

    if (deleteMode.validity.valid) {
        obj.deleteMode = deleteMode.value;
    }

    if (idleLength.validity.valid) {
        obj.idleLength = Number(idleLength.value);

        if (e.target === idleLength && obj.deleteMode === "idle") {
            let msg: MessageInterface = {
                state: MessageState.SET_IDLE,
                data: obj.idleLength
            };
            browser.runtime.sendMessage(msg);
        } else if (e.target === deleteMode) {
            let msg: MessageInterface = { state: null };
            if (obj.deleteMode === "idle") {
                msg.state = MessageState.SET_IDLE;
                msg.data = obj.idleLength;
            } else {
                msg.state = MessageState.SET_STARTUP;
            }
            browser.runtime.sendMessage(msg);
        }
    }

    if (notifications.validity.valid) {
        obj.notifications = JSON.parse(notifications.value);

        // create notification if enabled
        if (e.target === notifications && obj.notifications) {
            browser.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: browser.i18n.getMessage("notificationEnabled"),
                message: browser.i18n.getMessage("notificationEnabledBody")
            });
        }
    }


    // save options
    browser.storage.local.set(obj);
}

async function load(): Promise<void> {
    i18n();

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
        notificationRequestButton.setState(1);
    }
    // otherise disable option, set button to enable
    else {
        notifications.disabled = true;
        notificationRequestButton.setState(0);
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement().addEventListener("click", togglePermission);
box.addEventListener("input", save);
manualDeleteButton.addEventListener("click", manualDelete);

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);
