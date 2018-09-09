const DOM = generateElementsVariable([
    "days",
    "visitCount",
    "mode",
    "settings"
]);

function updateDays(e) {
    browser.storage.local.set({
        days: parseInt(DOM.days.value),
        visitCount: parseInt(DOM.visitCount.value),
        mode: DOM.mode.value
    });
    e.preventDefault();
}

async function restoreOptions() {
    const res = await browser.storage.local.get();
    DOM.days.value = res.days || 0;
    DOM.visitCount.value = res.visitCount || 0;
    DOM.mode.value = res.mode || "days";
}

DOM.settings.addEventListener("input", updateDays);
document.addEventListener("DOMContentLoaded", restoreOptions);
