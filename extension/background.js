/* global defaultValues */

async function filterByVisits(visitCount, end) {
    // brute force history items with visitCount or less visits
    let search = 1000;
    let history = await browser.history.search({text: "", maxResults: search, startTime: 0, endTime: end});
    while (search < history.length) {
        search += 1000;
        history = await browser.history.search({text: "", maxResults: search, startTime: 0, endTime: end});
    }
    return history.filter(item => item.visitCount <= visitCount);
}

async function deleteByVisits(visitCount, end) {
    let history = await filterByVisits(visitCount, end);
    for (let item of history) {
        browser.history.deleteUrl({url: item.url});
    }
}

async function deleteOlderThan(state) {
    if (state === "idle") {
        const res = await browser.storage.local.get();
        const days = parseInt(res.days) || 0;
        if (days !== 0) {
            // get date x days ago
            let end = new Date();
            end.setHours(0);
            end.setMinutes(0);
            end.setSeconds(0);
            end.setMilliseconds(0);
            end.setDate(end.getDate() - days);
            let endDate = end.getTime();
            if (res.deleteMode === "days") {
                // delete by range OR visit count and range
                if (res.visitCount === 0) {
                    browser.history.deleteRange({startTime: 0, endTime: endDate});
                } else {
                    deleteByVisits(res.visitCount, endDate);
                }
            }
        } else if (res.deleteMode === "visits") {
            deleteByVisits(res.visitCount, new Date().getTime());
        }
    }
}

async function setup() {
    let res = await browser.storage.local.get();
    res = defaultValues(res, {
        days: 0,
        visitCount: 0,
        deleteMode: "days"
    });
    if (typeof res.days === "string") {
        res.days = parseInt(res.days);
    }
    browser.storage.local.set(res);
}

browser.idle.onStateChanged.addListener(deleteOlderThan);
browser.runtime.onInstalled.addListener(setup);
