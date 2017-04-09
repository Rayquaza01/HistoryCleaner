function updateDays(e) {
    browser.storage.local.set({days: document.querySelector("#days").value});
    e.preventDefault();
}
function restoreOptions() {
    browser.storage.local.get().then((res) => {
        document.querySelector("#days").value = res.days || 0;
    });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("days").addEventListener("input", updateDays);
