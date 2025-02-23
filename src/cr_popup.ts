import { Options, OptionsInterface, FormElements } from "./OptionsInterface";
import { Message, MessageState } from "./MessageInterface";

import browser from "./we";

import { i18n } from "./i18n";

import { PermissionCheckbox } from "./PermissionCheckbox";

import "./popup.css";

i18n();

const form = document.querySelector("form") as HTMLFormElement;
const formElements = form.elements as FormElements;

const lastRunVisible = document.querySelector("#last-run") as HTMLSpanElement;
const nextRun = document.querySelector("#next-run") as HTMLSpanElement;

// sync buttons
const uploadButton = document.querySelector("#sync-up") as HTMLButtonElement;
const downloadButton = document.querySelector("#sync-down") as HTMLButtonElement;

const exportButton = document.querySelector("#export") as HTMLAnchorElement;
const importButton = document.querySelector("#import") as HTMLButtonElement;
const importFile = document.querySelector("#import-file") as HTMLInputElement;

// manual delete button
const manualDeleteButton = document.querySelector("#manual-delete") as HTMLButtonElement;

/**
 * Resets the trigger mode
 * Used when importing from file or sync
 * @param opts - The imported options to apply
 */
function resetTriggerMode(opts: Options) {
    // typically the trigger mode is initialized on startup or right as it's changed in the form
    // but if you import, the form is not updated and startup is not ran
    // so we have to reset the trigger mode manually
    const msg = new Message();

    switch (opts.deleteMode) {
        case "idle":
            msg.state = MessageState.SET_IDLE;
            msg.idleLength = opts.idleLength;
            break;
        case "startup":
            msg.state = MessageState.SET_STARTUP;
            break;
        case "timer":
            msg.state = MessageState.SET_TIMER;
            msg.timerInterval = opts.timerInterval;
            break;
    }

    browser.runtime.sendMessage(msg);
}

/**
 * Sends a message to the background script telling it to delete history
 */
function manualDelete(e: MouseEvent): void {
    e.preventDefault();
    console.log("Here?");

    const msg = new Message({ state: MessageState.DELETE });
    browser.runtime.sendMessage(msg);
}

/**
 * Upload current local storage to sync storage
 */
async function upload(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const res = new Options(await browser.storage.local.get());
    await browser.storage.sync.set(res);
    // location.reload();
}

/**
 * Download current sync storage to local storage
 *
 * Sets idle or startup based on the contents of the downloaded options
 */
async function download(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const res = new Options(await browser.storage.sync.get());

    resetTriggerMode(res);

    browser.storage.local.set(res);
    // location.reload();
}

/**
 * Imports the config from a file.
 */
function importConfig() {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
            const importedConfig = new Options(JSON.parse(reader.result));

            resetTriggerMode(importedConfig);

            browser.storage.local.set(importedConfig);
        }
    });

    if (importFile.files !== null && importFile.files.length > 0) {
        reader.readAsText(importFile.files[0]);
    }
}

/**
 * Saves inputs on options page to storage
 *  * Runs when input is changed by user
 *  * If user input is not valid, does not save
 *  * Set idle or startup based on input
 * @param e event object
 */
async function save(e?: Event): Promise<void> {
    if (form.checkValidity()) {
        const opts: OptionsInterface = {
            behavior: formElements.behavior.value,
            days: parseInt(formElements.days.value),
            deleteMode: formElements.deleteMode.value,
            idleLength: parseInt(formElements.idleLength.value),
            timerInterval: parseInt(formElements.timerInterval.value),
            notifications: formElements.notifications.checked,
            downloads: formElements.downloads.checked,
            // filterHistory: formElements.filterHistory.checked,
            // filterList: formElements.filterList.value.split("\n"),

            lastRun: formElements.lastRun.value,

            icon: formElements.icon.value,
        };

        if (opts.behavior === "disable") {
            manualDeleteButton.disabled = true;
            console.log("Disabled");
        } else {
            manualDeleteButton.disabled = false;
            console.log("Enabled");
        }

        if (e !== undefined) {
            const target = e.target as HTMLFieldSetElement;

            // if changing the setting will update idle / startup
            const msg = new Message();
            if ((target.name === "idleLength" || target.name === "deleteMode") && opts.deleteMode === "idle") {
                msg.state = MessageState.SET_IDLE;
                msg.idleLength = opts.idleLength;
                browser.runtime.sendMessage(msg);
            } else if (target.name === "deleteMode" && opts.deleteMode === "startup") {
                msg.state = MessageState.SET_STARTUP;
                browser.runtime.sendMessage(msg);
            } else if ((target.name === "timerInterval" || target.name === "deleteMode") && opts.deleteMode === "timer") {
                msg.state = MessageState.SET_TIMER;
                msg.timerInterval = opts.timerInterval;
                browser.runtime.sendMessage(msg);
            }

            const isNotificationPermissionGranted = await browser.permissions.contains({ permissions: ["notifications"] });
            if (!isNotificationPermissionGranted) {
                opts.notifications = false;
                console.log("Notification not granted yet");
            }

            // if notifications were enabled
            // if (target.name === "notifications" && opts.notifications) {
            //     browser.notifications.create({
            //         type: "basic",
            //         iconUrl: "icons/icon-96.png",
            //         title: browser.i18n.getMessage("notificationEnabled"),
            //         message: browser.i18n.getMessage("notificationEnabledBody")
            //     });
            // }
        }

        console.log("Saving", opts);


        // save options
        browser.storage.local.set(opts);

        if (e !== undefined && (e.target as HTMLInputElement).name === "notifications") {
            load();
        }
    }
}

/**
 * Runs on page load
 * Loads current options to inputs on page
 */
async function load(): Promise<void> {
    const res = new Options(await browser.storage.local.get());
    console.log("Loading", res);

    formElements.behavior.value = res.behavior.toString();
    formElements.days.value = res.days.toString();
    formElements.idleLength.value = res.idleLength.toString();
    formElements.timerInterval.value = res.timerInterval.toString();
    formElements.deleteMode.value = res.deleteMode;
    formElements.notifications.checked = res.notifications;
    // formElements.filterHistory.checked = res.filterHistory;
    // formElements.filterList.value = res.filterList.join("\n");

    formElements.icon.value = res.icon;

    if (res.behavior === "disable") {
        nextRun.innerText = browser.i18n.getMessage("statisticsNextRunDisable");
    } else {
        const alarm = await browser.alarms.get("DeleteHistoryAlarm");
        if (res.deleteMode === "timer" && alarm !== undefined) {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunTimer", [ new Date(alarm.scheduledTime).toLocaleString() ]);
        }

        if (res.deleteMode === "idle") {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunIdle");
        }

        if (res.deleteMode === "startup") {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunStartup");
        }
    }


    formElements.lastRun.value = res.lastRun;
    lastRunVisible.innerText = res.lastRun;

    if (res.behavior === "disable") {
        manualDeleteButton.disabled = true;
    } else {
        manualDeleteButton.disabled = false;
    }

    // allow config to be exported
    exportButton.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res));
}

document.addEventListener("DOMContentLoaded", load);
// notificationRequestButton.getElement().addEventListener("click", togglePermission);
form.addEventListener("input", save);
manualDeleteButton.addEventListener("click", manualDelete);

formElements.notifications.addEventListener("change", (e) => PermissionCheckbox(["notifications"], e, save));
formElements.downloads.addEventListener("change", (e) => PermissionCheckbox(["downloads"], e, save));

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);

importButton.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", importConfig);

browser.storage.onChanged.addListener(load);
