import browser from "webextension-polyfill";

/** The number of entries to get at once */
const HISTORY_LIMIT = 100;

/**
 * Deletes history iteratively, excluding history items that match certain hostnames
 * @param end The end date for deletion
 * @param excludeFromDeletion A list of hostnames that won't be deleted
 */
export async function deleteHistoryWithExclusions(end: Date, excludeFromDeletion: string[]): Promise<void> {
    let nextPage = end;
    let hist: browser.History.HistoryItem[] = [];

    excludeFromDeletion = excludeFromDeletion.filter(item => item !== "");

    let count = 0;

    do {
        console.log("Deleting History before ", nextPage);

        // queries all history after between 0 and end date
        // browser.history.search returns most recent history first,
        // so we decrement the end time for each iteration
        hist = await browser.history.search({
            text: "",
            startTime: 0,
            endTime: nextPage,
            maxResults: HISTORY_LIMIT
        });

        let toDelete: browser.History.HistoryItem[] = [];

        if (excludeFromDeletion.length === 0) {
            toDelete = hist;
        } else {
            // if hostname is not in include list, history should be deleted
            toDelete = hist
                .filter(item => {
                    const url = new URL(item.url ?? "");
                    // console.log(url.hostname, "Matches?", !excludeFromDeletion.includes(url.hostname));

                    // if match for hostname is not found in the exclusion list, history item can be deleted
                    return excludeFromDeletion.find(exclusion => exclusion.endsWith(url.hostname)) === null;
                });
        }

        count += toDelete.length;

        // delete items on the to delete list
        toDelete.forEach(item => browser.history.deleteUrl({ url: item.url ?? "" }));

        console.log(hist.map(item => item.lastVisitTime));

        // sort history to make sure we're picking the correct value for the next iteration
        // i don't think this is nessecary (it should already be sorted), but just in case
        hist.sort((a, b) => (a.lastVisitTime ?? 0) - (b.lastVisitTime ?? 0));
        nextPage = new Date(hist[0].lastVisitTime ?? 0);

        console.log(hist.map(item => item.lastVisitTime));
    } while (hist.length === HISTORY_LIMIT);
    // if we get less than the limit, we've hit the bottom of history

    const prevCount: number = (await browser.storage.local.get("deleteCount")).deleteCount ?? 0;
    browser.storage.local.set({ deleteCount: prevCount + count });

    console.log("Deleted ", count, " items");
}
