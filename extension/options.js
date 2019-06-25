/* global generateElementsVariable */

const DOM = generateElementsVariable([
    "days",
    "visitCount",
    "mode",
    "settings"
]);

function disable(mode) {
    if (mode === "days") {
        DOM.visitCount.disabled = true;
    } else {
        DOM.visitCount.disabled = false;
    }
}

function updateDays(e) {
    disable(DOM.mode.value);

    browser.storage.local.set({
        days: parseInt(DOM.days.value),
        visitCount: parseInt(DOM.visitCount.value),
        deleteMode: DOM.mode.value
    });
    e.preventDefault();
}

async function restoreOptions() {
    const res = await browser.storage.local.get();
    DOM.days.value = res.days || 0;
    DOM.visitCount.value = res.visitCount || 0;
    DOM.mode.value = res.deleteMode || "days";

    disable(res.deleteMode);
}

DOM.settings.addEventListener("input", updateDays);
document.addEventListener("DOMContentLoaded", restoreOptions);
