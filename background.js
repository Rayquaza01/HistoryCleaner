browser.idle.onStateChanged.addListener(function(state) {
    if (state == 'idle') {
        browser.storage.local.get('days', function(res) {
            if (res.days != 0) {
                var end = new Date();
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                end.setMilliseconds(0);
                end.setDate(end.getDate() - res.days);
                browser.history.deleteRange({startTime: 0, endTime: end.getTime()});
            }
        });
    }
});
