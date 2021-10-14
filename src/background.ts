import browser, { Idle, Runtime } from "webextension-polyfill";
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
            break;
        // set startup mode
        case MessageState.SET_STARTUP:
            // remove idle listener
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }
            break;
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
    // if delete mode is idle, set interval and add listener
    if (res.deleteMode === "idle") {
        browser.idle.setDetectionInterval(res.idleLength);
        browser.idle.onStateChanged.addListener(idleListener);
    }
    // if delete mode is startup, delete history right now
    else if (res.deleteMode === "startup") {
        deleteHistory();
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

/**
 * Deletes history older than specified days
 *  * Takes no action if behavior is set to disable
 *  * Deletes older than days if behavior is set to days
 *  * Deletes all history if behavior is set to all
 *  * Creates notification if notifications are enabled
 */
async function deleteHistory(): Promise<void> {
    const res = new Options(await browser.storage.local.get());
    if (res.behavior === "days") {
        const end = new Date();
        end.setHours(0);
        end.setMinutes(0);
        end.setSeconds(0);
        end.setMilliseconds(0);
        end.setDate(end.getDate() - res.days);
        await browser.history.deleteRange({
            startTime: 0,
            endTime: end.getTime()
        });
        const notificationBody: string = browser.i18n.getMessage(
            "historyDeletedNotificationBody",
            [
                end.toLocaleString(),
                new Date().toLocaleString()
            ]
        );
        console.log(notificationBody);
        if (res.notifications) {
            browser.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: browser.i18n.getMessage("historyDeletedNotification"),
                message: notificationBody
            });
        }
    } else if (res.behavior === "all") {
        await browser.history.deleteAll();
        console.log(browser.i18n.getMessage("historyAllDeleted"));
        browser.notifications.create({
            type: "basic",
            iconUrl: "icons/icon-96.png",
            title: browser.i18n.getMessage("historyDeletedNotification"),
            message: browser.i18n.getMessage("historyAllDeleted")
        });
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.runtime.onInstalled.addListener(setup);
browser.runtime.onStartup.addListener(startup);
