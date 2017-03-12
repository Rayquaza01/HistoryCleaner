browser.idle.onStateChanged.addListener((state) => {
    if (state == 'idle') {
        browser.storage.local.get('days').then((res) => {
            var days = parseInt(res.days) || 0;
            if (days !== 0) {
                var end = new Date();
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                end.setMilliseconds(0);
                end.setDate(end.getDate() - days);
                browser.history.deleteRange({startTime: 0, endTime: end.getTime()});
            }
        });
    }
});
