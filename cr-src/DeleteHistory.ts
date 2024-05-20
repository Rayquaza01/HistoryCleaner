import { Options } from "./OptionsInterface";

/**
 * Deletes history older than specified days
 *  * Takes no action if behavior is set to disable
 *  * Deletes older than days if behavior is set to days
 *  * Deletes all history if behavior is set to all
 *  * Creates notification if notifications are enabled
 */
export async function deleteHistory(opts?: Options): Promise<void> {
    const res = opts ?? new Options(await chrome.storage.local.get());
    if (res.behavior === "days") {
        const end = new Date();
        end.setHours(0);
        end.setMinutes(0);
        end.setSeconds(0);
        end.setMilliseconds(0);
        end.setDate(end.getDate() - res.days);
        await chrome.history.deleteRange({
            startTime: 0,
            endTime: end.getTime()
        });

        const notificationBody: string = chrome.i18n.getMessage(
            "historyDeletedNotificationBody",
            [
                end.toLocaleString(),
                new Date().toLocaleString()
            ]
        );
        console.log(notificationBody);
        if (res.notifications) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: chrome.i18n.getMessage("historyDeletedNotification"),
                message: notificationBody
            });
        }

        chrome.storage.local.set({ lastRun: notificationBody });
    } else if (res.behavior === "all") {
        const notificationBody = chrome.i18n.getMessage("historyAllDeleted", [new Date().toLocaleString()]);

        await chrome.history.deleteAll();

        console.log(notificationBody);

        if (res.notifications) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: chrome.i18n.getMessage("historyDeletedNotification"),
                message: notificationBody
            });
        }

        chrome.storage.local.set({ lastRun: notificationBody });
    }
}

