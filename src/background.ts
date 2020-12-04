import { browser, Idle, Runtime } from "webextension-polyfill-ts";
import { OptionsInterface, DefaultOptions} from "./OptionsInterface";
import { MessageInterface, MessageState } from "./MessageInterface";

function onMessage(msg: MessageInterface): Promise<void> {
    switch (msg.state) {
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
            browser.idle.setDetectionInterval(msg.data);
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
    return Promise.resolve();
}

function idleListener(state: Idle.IdleState): void {
    // delete history if state is idle
    if (state === "idle") {
        deleteHistory();
    }
}

async function startup(): Promise<void> {
    const res = await browser.storage.local.get() as OptionsInterface;
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

async function setup(installed: Runtime.OnInstalledDetailsType): Promise<void> {
    if (installed.reason === "install" || installed.reason === "update") {
        const res = await browser.storage.local.get();
        // apply default values to storage
        for (const key of Object.keys(DefaultOptions)) {
            res[key] ??= DefaultOptions[key];
        }
        await browser.storage.local.set(res);

        // initialize sync object
        const syncRes = await browser.storage.sync.get();
        for (const key of Object.keys(DefaultOptions)) {
            syncRes[key] ??= DefaultOptions[key];
        }
        await browser.storage.sync.set(syncRes);

        startup();
        // open options page on first install
        if (installed.reason === "install") {
            browser.runtime.openOptionsPage();
        }
    }
}

async function deleteHistory(): Promise<void> {
    const res = await browser.storage.local.get();
    if (res.days > 0) {
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
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.runtime.onInstalled.addListener(setup);
browser.runtime.onStartup.addListener(startup);
