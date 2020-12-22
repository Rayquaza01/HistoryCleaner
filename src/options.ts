import { browser } from "webextension-polyfill-ts";
import { ToggleButton, ToggleButtonState } from "./ToggleButton";
import { Message, MessageState } from "./MessageInterface";
import { i18n } from "./i18n";
import { Options } from "./OptionsInterface";

// Input elements
// type casting because the elements will always exist, provided the HTML is correct
const days = document.querySelector("#days") as HTMLInputElement;
const idleLength = document.querySelector("#idleLength") as HTMLInputElement;
const deleteMode = document.querySelector("#deleteMode") as HTMLSelectElement;
const notifications = document.querySelector("#notifications") as HTMLInputElement;

// parent to input elements
const box = document.querySelector("#box") as HTMLDivElement;

// sync buttons
const uploadButton = document.querySelector("#syncUp") as HTMLButtonElement;
const downloadButton = document.querySelector("#syncDown") as HTMLButtonElement;

// permission toggle button
const notificationRequestButton: ToggleButton = new ToggleButton(
    document.querySelector("#notification-permission-request") as HTMLButtonElement,
    [browser.i18n.getMessage("notificationRequest"), browser.i18n.getMessage("notificationRevoke")]
);

// manual delete button
const manualDeleteButton = document.querySelector("#manual-delete") as HTMLButtonElement;

/**
 * Sends a message to the background script telling it to delete the
 */
function manualDelete(): void {
    const msg = new Message({ state: MessageState.DELETE });
    browser.runtime.sendMessage(msg);
}

function togglePermission(): void {
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
                    notifications.checked = false;
                    notifications.disabled = true;
                    browser.storage.local.set({ notifications: false });
                }
            });
    }
    // if permission currently granted
    // revoke permission, switch button state, disable notifications, and disable option
    else if (notificationRequestButton.getState() === ToggleButtonState.PERMISSION) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
        notifications.checked = false;
        notifications.disabled = true;
        browser.storage.local.set({ notifications: false });
    }
}

async function upload(): Promise<void> {
    const res = await browser.storage.local.get();
    await browser.storage.sync.set(res);
    location.reload();
}

async function download(): Promise<void> {
    const res = await browser.storage.sync.get();

    // set delete mode from sync get
    const msg = new Message();
    if (res.deleteMode === "idle") {
        msg.state = MessageState.SET_IDLE;
        msg.idleLength = res.idleLength;
        browser.runtime.sendMessage(msg);
    } else if (res.deleteMode === "startup") {
        msg.state = MessageState.SET_STARTUP;
        browser.runtime.sendMessage(msg);
    }

    // disable notifications if permission not allowed
    if (notificationRequestButton.getState() === ToggleButtonState.NO_PERMISSION) {
        res.notifications = false;
    }

    await browser.storage.local.set(res);
    location.reload();
}

async function save(e: Event): Promise<void> {
    // if options are valid
    const opts = new Options(await browser.storage.local.get());
    if (days.validity.valid) {
        opts.days = Number(days.value);
    }

    if (deleteMode.validity.valid) {
        opts.deleteMode = deleteMode.value;
    }

    if (idleLength.validity.valid) {
        opts.idleLength = Number(idleLength.value);

        if (e.target === idleLength && opts.deleteMode === "idle") {
            const msg = new Message({
                state: MessageState.SET_IDLE,
                idleLength: opts.idleLength
            });
            browser.runtime.sendMessage(msg);
        } else if (e.target === deleteMode) {
            const msg = new Message();
            if (opts.deleteMode === "idle") {
                msg.state = MessageState.SET_IDLE;
                msg.idleLength = opts.idleLength;
            } else {
                msg.state = MessageState.SET_STARTUP;
            }
            browser.runtime.sendMessage(msg);
        }
    }

    if (notifications.validity.valid) {
        opts.notifications = notifications.checked;

        // create notification if enabled
        if (e.target === notifications && opts.notifications) {
            browser.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: browser.i18n.getMessage("notificationEnabled"),
                message: browser.i18n.getMessage("notificationEnabledBody")
            });
        }
    }


    // save options
    browser.storage.local.set(opts);
}

async function load(): Promise<void> {
    i18n();

    const res = await browser.storage.local.get();
    days.value = res.days;
    idleLength.value = res.idleLength;
    deleteMode.value = res.deleteMode;
    notifications.checked = res.notifications;

    // check permissions
    const permissions = await browser.permissions.getAll();
    // if notification permission
    // enable notification option, set button to revoke
    if (Array.isArray(permissions.permissions) && permissions.permissions.includes("notifications")) {
        notifications.disabled = false;
        notificationRequestButton.setState(ToggleButtonState.PERMISSION);
    }
    // otherise disable option, set button to enable
    else {
        notifications.disabled = true;
        notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement().addEventListener("click", togglePermission);
box.addEventListener("input", save);
manualDeleteButton.addEventListener("click", manualDelete);

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);
