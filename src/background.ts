import { browser, Idle, Runtime } from "webextension-polyfill-ts";

async function setup(installed: Runtime.OnInstalledDetailsType) {
    if (installed.reason === "install" || installed.reason === "update") {
        let res = await browser.storage.local.get();
        res.days ??= 0;
        res.notifications ??= false;
        browser.storage.local.set(res);
    }
}

async function deleteHistory(state: Idle.IdleState) {
    if (state === "idle") {
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
                    message: `History deleted at ${new Date().toLocaleString()}`
                })
            }
        }
    };
}

browser.idle.onStateChanged.addListener(deleteHistory);
browser.runtime.onInstalled.addListener(setup);
