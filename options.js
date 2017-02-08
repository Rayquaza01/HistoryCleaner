function saveOptions(e) {
    browser.storage.local.set({days: document.querySelector("#days").value});
    e.preventDefault();
}
function restoreOptions() {
    browser.storage.local.get('days', function(res) {
        document.querySelector("#days").value = res.days || 0;
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
