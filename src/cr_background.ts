import { Runtime, Alarms } from "webextension-polyfill";
import { deleteHistory } from "./DeleteHistory";
import { Options } from "./OptionsInterface";
import { MessageInterface, MessageState, Message } from "./MessageInterface";
import browser from "./we";

function IconLookup(icon: string): string {
    switch (icon) {
        case "theme":
            return "icons/icon-96.png";
        case "icon_circle":
            return "icons/icon_red_circle.png";
        case "icon_circle_gradient":
            return "icons/icon_red_circle_gradient.png";
        case "icon_square":
            return "icons/icon_red_square.png";
        case "icon_square_gradient":
            return "icons/icon_red_square_gradient.png";
        default:
            return "icons/icon-96.png";
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
            // this should never run on chrome!
            break;
        // set startup mode
        case MessageState.SET_STARTUP:
            browser.alarms.clear("DeleteHistoryAlarm");
            break;
        case MessageState.SET_TIMER:
            // delete old alarm
            browser.alarms.clear("DeleteHistoryAlarm");

            // create a new one with new period
            browser.alarms.create("DeleteHistoryAlarm", { delayInMinutes: 1, periodInMinutes: message.timerInterval });
            break;
        case MessageState.SET_ICON:
            browser.action.setIcon({ path: IconLookup(message.icon) });
            break;
    }
}

async function onAlarm(alarm: Alarms.Alarm) {
    if (alarm.name === "DeleteHistoryAlarm") {
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
        case "idle":
            // should never run on chrome!
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

    browser.action.setIcon({ path: IconLookup(res.icon) });
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
        // doing this in manifest v3 causes the bg script to get unloaded
        // unsure of why
        //
        // const syncRes = new Options(await browser.storage.sync.get());
        // await browser.storage.sync.set(syncRes);

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
