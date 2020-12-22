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
 * Sends a message to the background script telling it to delete history
 */
function manualDelete(): void {
    const msg = new Message({ state: MessageState.DELETE });
    browser.runtime.sendMessage(msg);
}

/**
 * Toggle notifications permission
 *
 * Activates when the notification request button is pressed.
 * Requests or revokes notification permission based on the state of the button.
 *
 * Updates the button state afterwards
 */
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

/**
 * Upload current local storage to sync storage
 */
async function upload(): Promise<void> {
    const res = new Options(await browser.storage.local.get());
    await browser.storage.sync.set(res);
    location.reload();
}

/**
 * Download current sync storage to local storage
 *
 * Sets idle or startup based on the contents of the downloaded options
 */
async function download(): Promise<void> {
    const res = new Options(await browser.storage.sync.get());

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

/**
 * Saves inputs on options page to storage
 *  * Runs when input is changed by user
 *  * If user input is not valid, falls back to data already in storage
 *  * Set idle or startup based on input
 * @param e event object
 */
async function save(e: Event): Promise<void> {
    const opts = new Options(await browser.storage.local.get());

    // if options are valid
    if (days.validity.valid) {
        opts.days = Number(days.value);
    }

    if (deleteMode.validity.valid) {
        opts.deleteMode = deleteMode.value;
    }

    if (idleLength.validity.valid) {
        opts.idleLength = Number(idleLength.value);

        const msg = new Message();
        // if changing the setting will update idle / startup
        if ((e.target === idleLength || e.target === deleteMode) && opts.deleteMode === "idle") {
            msg.state = MessageState.SET_IDLE;
            msg.idleLength = opts.idleLength;
            browser.runtime.sendMessage(msg);
        } else if (e.target === deleteMode && opts.deleteMode === "startup") {
            msg.state = MessageState.SET_STARTUP;
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

/**
 * Runs on page load
 *  * Adds i18n text to the page
 *  * Loads current options to inputs on page
 */
async function load(): Promise<void> {
    i18n();

    const res = new Options(await browser.storage.local.get());
    days.value = res.days.toString();
    idleLength.value = res.idleLength.toString();
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
