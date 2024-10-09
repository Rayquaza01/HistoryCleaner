import browser from "./we";
import { Options } from "./OptionsInterface";

/**
 * Deletes history older than specified days
 *  * Takes no action if behavior is set to disable
 *  * Deletes older than days if behavior is set to days
 *  * Deletes all history if behavior is set to all
 *  * Creates notification if notifications are enabled
 */
export async function deleteHistory(opts?: Options): Promise<void> {
    const res = opts ?? new Options(await browser.storage.local.get());
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

        if (res.downloads) {
            await browser.downloads.erase({ endedBefore: end.toISOString() });
        }

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

        browser.storage.local.set({ lastRun: notificationBody });
    } else if (res.behavior === "all") {
        const notificationBody = browser.i18n.getMessage("historyAllDeleted", [new Date().toLocaleString()]);

        await browser.history.deleteAll();

        if (res.downloads) {
            await browser.downloads.erase({ endedBefore: new Date() });
        }

        console.log(notificationBody);

        if (res.notifications) {
            browser.notifications.create({
                type: "basic",
                iconUrl: "icons/icon-96.png",
                title: browser.i18n.getMessage("historyDeletedNotification"),
                message: notificationBody
            });
        }

        browser.storage.local.set({ lastRun: notificationBody });
    }
}

