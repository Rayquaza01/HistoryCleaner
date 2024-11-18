import { Idle, Runtime, Alarms } from "webextension-polyfill";
import { deleteHistory } from "./DeleteHistory";
import { Options } from "./OptionsInterface";
import { MessageInterface, MessageState, Message } from "./MessageInterface";

function IconLookup(icon: string): string {
    switch (icon) {
        case "theme":
            return "icons/icon.svg";
        case "icon_circle":
            return "icons/icon_red_circle.png";
        case "icon_circle_gradient":
            return "icons/icon_red_circle_gradient.png";
        case "icon_square":
            return "icons/icon_red_square.png";
        case "icon_square_gradient":
            return "icons/icon_red_square_gradient.png";
        default:
            return "icons/icon.svg";
    }
}

/**
 * Message listener
 *
 * Listens for messages from options page
 *  * Deletes message when Manual delete button is pressed
 *  * Sets delete mode to idle (updates detection interval and adds event listener)
 *  * Sets delete mode to startup (removes event listener)
 * @param msg The message from the options page
 */
async function onMessage(msg: unknown): Promise<void> {
    const message = new Message(msg as Partial<MessageInterface>);

    switch (message.state) {
        // manual delete button
        case MessageState.DELETE:
            deleteHistory();
            break;
        // set idle mode
        case MessageState.SET_IDLE:
            // remove idle listener if one exists
            if (chrome.idle.onStateChanged.hasListener(idleListener)) {
                chrome.idle.onStateChanged.removeListener(idleListener);
            }
            // set idle length
            chrome.idle.setDetectionInterval(message.idleLength);
            // add idle listener
            chrome.idle.onStateChanged.addListener(idleListener);

            chrome.alarms.clear("DeleteHistoryAlarm");
            break;
        // set startup mode
        case MessageState.SET_STARTUP:
            // remove idle listener
            if (chrome.idle.onStateChanged.hasListener(idleListener)) {
                chrome.idle.onStateChanged.removeListener(idleListener);
            }

            chrome.alarms.clear("DeleteHistoryAlarm");
            break;
        case MessageState.SET_TIMER:
            if (chrome.idle.onStateChanged.hasListener(idleListener)) {
                chrome.idle.onStateChanged.removeListener(idleListener);
            }

            // delete old alarm
            chrome.alarms.clear("DeleteHistoryAlarm");

            // create a new one with new period
            chrome.alarms.create("DeleteHistoryAlarm", { delayInMinutes: 1, periodInMinutes: message.timerInterval });
            break;
        case MessageState.SET_ICON:
            chrome.browserAction.setIcon({ path: IconLookup(message.icon) });
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
    const res = new Options(await chrome.storage.local.get());

    switch (res.deleteMode) {
        // if delete mode is idle, set interval and add listener
        case "idle":
            chrome.idle.setDetectionInterval(res.idleLength);
            chrome.idle.onStateChanged.addListener(idleListener);
            break;
        // if delete mode is startup, delete history right now
        case "startup":
            deleteHistory();
            break;
        // if delete mode is timer, set alarm to run at timer interval
        case "timer":
            chrome.alarms.create("DeleteHistoryAlarm", { delayInMinutes: 1, periodInMinutes: res.timerInterval });
            break;
    }

    browser.browserAction.setIcon({ path: IconLookup(res.icon) });
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
        const res = new Options(await chrome.storage.local.get());
        await chrome.storage.local.set(res);

        // initialize sync object
        const syncRes = new Options(await chrome.storage.sync.get());
        await chrome.storage.sync.set(syncRes);

        startup();
        // open options page on first install
        if (installed.reason === "install") {
            chrome.runtime.openOptionsPage();
        }
    }
}

chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
chrome.runtime.onInstalled.addListener(setup);
chrome.runtime.onStartup.addListener(startup);
