import * as browser from "webextension-polyfill";
import { ToggleButton, ToggleButtonState } from "./ToggleButton";
import { Message, MessageState } from "./MessageInterface";
import { i18n } from "./i18n";
import { Options, OptionsInterface, FormElements } from "./OptionsInterface";

require("./options.css");

// parent to input elements
const form = document.querySelector("#box") as HTMLFormElement;
const formElements = form.elements as FormElements;

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
                    formElements.notifications.disabled = false;
                }
                // otherwise, keep button state same, turn off notifications, disable option
                else {
                    notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
                    formElements.notifications.checked = false;
                    formElements.notifications.disabled = true;
                    browser.storage.local.set({ notifications: false });
                }
            });
    }
    // if permission currently granted
    // revoke permission, switch button state, disable notifications, and disable option
    else if (notificationRequestButton.getState() === ToggleButtonState.PERMISSION) {
        browser.permissions.remove({ permissions: ["notifications"] });
        notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
        formElements.notifications.checked = false;
        formElements.notifications.disabled = true;
        browser.storage.local.set({ notifications: false });
    }
}

/**
 * Upload current local storage to sync storage
 */
async function upload(): Promise<void> {
    const res = new Options(await browser.storage.local.get() as OptionsInterface);
    await browser.storage.sync.set(res);
    location.reload();
}

/**
 * Download current sync storage to local storage
 *
 * Sets idle or startup based on the contents of the downloaded options
 */
async function download(): Promise<void> {
    const res = new Options(await browser.storage.sync.get() as OptionsInterface);

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
 *  * If user input is not valid, does not save
 *  * Set idle or startup based on input
 * @param e event object
 */
function save(e: Event): void {
    const target = e.target as HTMLFieldSetElement;

    if (form.checkValidity()) {
        const opts: OptionsInterface = {
            behavior: formElements.behavior.value,
            days: parseInt(formElements.days.value),
            deleteMode: formElements.deleteMode.value,
            idleLength: parseInt(formElements.idleLength.value),
            notifications: formElements.notifications.checked
        };

        const msg = new Message();
        // if changing the setting will update idle / startup
        if ((target.name === "idleLength" || target.name === "deleteMode") && opts.deleteMode === "idle") {
            msg.state = MessageState.SET_IDLE;
            msg.idleLength = opts.idleLength;
            browser.runtime.sendMessage(msg);
        } else if (target.name === "deleteMode" && opts.deleteMode === "startup") {
            msg.state = MessageState.SET_STARTUP;
            browser.runtime.sendMessage(msg);
        }

        if (target.name === "notifications" && opts.notifications) {
            browser.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: browser.i18n.getMessage("notificationEnabled"),
                message: browser.i18n.getMessage("notificationEnabledBody")
            });
        }

        // save options
        browser.storage.local.set(opts);
    }
}

/**
 * Runs on page load
 *  * Adds i18n text to the page
 *  * Loads current options to inputs on page
 */
async function load(): Promise<void> {
    i18n();

    const res = new Options(await browser.storage.local.get() as OptionsInterface);
    formElements.behavior.value = res.behavior.toString();
    formElements.days.value = res.days.toString();
    formElements.idleLength.value = res.idleLength.toString();
    formElements.deleteMode.value = res.deleteMode;
    formElements.notifications.checked = res.notifications;

    // check permissions
    const permissions = await browser.permissions.getAll();
    // if notification permission
    // enable notification option, set button to revoke
    if (Array.isArray(permissions.permissions) && permissions.permissions.includes("notifications")) {
        formElements.notifications.disabled = false;
        notificationRequestButton.setState(ToggleButtonState.PERMISSION);
    }
    // otherise disable option, set button to enable
    else {
        formElements.notifications.disabled = true;
        notificationRequestButton.setState(ToggleButtonState.NO_PERMISSION);
    }
}

document.addEventListener("DOMContentLoaded", load);
notificationRequestButton.getElement().addEventListener("click", togglePermission);
form.addEventListener("input", save);
manualDeleteButton.addEventListener("click", manualDelete);

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);
