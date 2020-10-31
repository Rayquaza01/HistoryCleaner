import { browser, Idle, Runtime } from "webextension-polyfill-ts";
import { OptionsInterface, DefaultOptions} from "./OptionsInterface";
import { MessageInterface } from "./MessageInterface";

function onMessage(msg: MessageInterface): void {
    switch (msg.state) {
        case "delete":
            deleteHistory();
            break;
        case "setidle":
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }
            browser.idle.setDetectionInterval(msg.data);
            browser.idle.onStateChanged.addListener(idleListener);
            break;
        case "setstartup":
            if (browser.idle.onStateChanged.hasListener(idleListener)) {
                browser.idle.onStateChanged.removeListener(idleListener);
            }
            break;
    }
}

function idleListener(state: Idle.IdleState): void {
    if (state === "idle") {
        deleteHistory();
    }
}

async function startup(): Promise<void> {
    let res = await browser.storage.local.get() as OptionsInterface;
    if (res.deleteMode === "idle") {
        browser.idle.setDetectionInterval(res.idleLength);
        browser.idle.onStateChanged.addListener(idleListener);
    } else if (res.deleteMode === "startup") {
        deleteHistory();
    }
}

async function setup(installed: Runtime.OnInstalledDetailsType) {
    if (installed.reason === "install" || installed.reason === "update") {
        let res = await browser.storage.local.get();
        for (let key of Object.keys(DefaultOptions)) {
            res[key] ??= DefaultOptions[key];
        }
        await browser.storage.local.set(res);

        // initialize sync object
        let syncRes = await browser.storage.sync.get();
        for (let key of Object.keys(DefaultOptions)) {
            syncRes[key] ??= DefaultOptions[key];
        }
        await browser.storage.sync.set(syncRes);

        startup();
        if (installed.reason === "install") {
            browser.runtime.openOptionsPage();
        }
    }
}

async function deleteHistory(): Promise<void> {
    let res = await browser.storage.local.get();
    if (res.days > 0) {
        let end = new Date();
        end.setHours(0);
        end.setMinutes(0)
        end.setSeconds(0);
        end.setMilliseconds(0);
        end.setDate(end.getDate() - res.days);
        await browser.history.deleteRange({
            startTime: 0,
            endTime: end.getTime()
        });
        if (res.notifications) {
            browser.notifications.create("history-deleted", {
                type: "basic",
                title: "History deleted",
                message: `History from before ${end.toLocaleString()} deleted at ${new Date().toLocaleString()}`
            });
        }
    }
}

browser.runtime.onMessage.addListener(onMessage);
browser.runtime.onInstalled.addListener(setup);
browser.runtime.onStartup.addListener(startup);
