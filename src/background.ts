import { Idle, Runtime, Alarms } from "webextension-polyfill";
import { deleteHistory } from "./DeleteHistory";
import { Options } from "./OptionsInterface";
import { MessageInterface, MessageState, Message } from "./MessageInterface";

/**
 * Message listener
 *
 * Listens for messages from options page
 *  * Deletes message when Manual delete button is pressed
 *  * Sets delete mode to idle (updates detection interval and adds event listener)
 *  * Sets delete mode to startup (removes event listener)
 * @param msg The message from the options page
 */
async function onMessage(msg: MessageInterface): Promise<void> {
    const message = new Message(msg);
    switch (message.state) {
        // manual delete button
        case MessageState.DELETE:
            deleteHistory();
            break;
        // set idle mode
        case MessageState.SET_IDLE:
            // remove idle listener if one exists
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }
            // set idle length
            browser.idle.setDetectionInterval(msg.idleLength);
            // add idle listener
            browser.idle.onStateChanged.addListener(idleListener);

            browser.alarms.clear("DeleteHistoryAlarm");
            break;
        // set startup mode
        case MessageState.SET_STARTUP:
            // remove idle listener
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }

            browser.alarms.clear("DeleteHistoryAlarm");
            break;
        case MessageState.SET_TIMER:
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }

            // delete old alarm
            browser.alarms.clear("DeleteHistoryAlarm");

            // create a new one with new period
            browser.alarms.create("DeleteHistoryAlarm", { delayInMinutes: 1, periodInMinutes: message.timerInterval });
            break;

    }
}

async function onAlarm(alarm: Alarms.Alarm) {
    if (alarm.name === "DeleteHistoryAlarm") {
        deleteHistory();
    }
}

/**
 * Attached to idle onStateChanged listener
 *
 * Deletes history if new state is "idle"
 * @param state New state on idle change
 */
function idleListener(state: Idle.IdleState): void {
    // delete history if state is idle
    if (state === "idle") {
        deleteHistory();
    }
}

/**
 * Runs at browser startup
 *  * Sets event listener and detection length if delete mode set to idle
 *  * Deletes history if set delete mode set to startup
 */
async function startup(): Promise<void> {
    const res = new Options(await browser.storage.local.get());

    switch (res.deleteMode) {
        // if delete mode is idle, set interval and add listener
        case "idle":
            browser.idle.setDetectionInterval(res.idleLength);
            browser.idle.onStateChanged.addListener(idleListener);
            break;
        // if delete mode is startup, delete history right now
        case "startup":
            deleteHistory();
            break;
        // if delete mode is timer, set alarm to run at timer interval
        case "timer":
            browser.alarms.create("DeleteHistoryAlarm", { delayInMinutes: 1, periodInMinutes: res.timerInterval });
            break;
    }
}

/**
 * Runs on extension install or update (not browser update)
 *  * Initializes local and sync storage
 *  * Opens options page on first install
 * @param installed Reason for install
 */
async function setup(installed: Runtime.OnInstalledDetailsType): Promise<void> {
    if (installed.reason === "install" || installed.reason === "update") {
        // apply default values to storage
        const res = new Options(await browser.storage.local.get());
        await browser.storage.local.set(res);

        // initialize sync object
        const syncRes = new Options(await browser.storage.sync.get());
        await browser.storage.sync.set(syncRes);

        startup();
        // open options page on first install
        if (installed.reason === "install") {
            browser.runtime.openOptionsPage();
        }
    }
}

browser.alarms.onAlarm.addListener(onAlarm);
browser.runtime.onMessage.addListener(onMessage);
browser.runtime.onInstalled.addListener(setup);
browser.runtime.onStartup.addListener(startup);
