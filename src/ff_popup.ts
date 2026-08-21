import { Options, OptionsInterface, FormElements, type RegexHistoryEntry } from "./OptionsInterface";
import { Message, MessageState } from "./MessageInterface";

import browser from "./we";

import { PermissionCheckbox } from "./PermissionCheckbox";

import { previewRegexClean, deleteUrls, REGEX_SEARCH_CAP, type RegexPreview, type RegexMatch } from "./RegexClean";

import { renderRegexTokens } from "./RegexHighlight";

import { i18n } from "./i18n";

import "./popup.css";

i18n();

const form = document.querySelector("form") as HTMLFormElement;
const formElements = form.elements as FormElements;

const lastRunVisible = document.querySelector("#last-run") as HTMLSpanElement;
const nextRun = document.querySelector("#next-run") as HTMLSpanElement;

// sync buttons
const uploadButton = document.querySelector("#sync-up") as HTMLButtonElement;
const downloadButton = document.querySelector("#sync-down") as HTMLButtonElement;

const exportButton = document.querySelector("#export") as HTMLAnchorElement;
const importButton = document.querySelector("#import") as HTMLButtonElement;
const importFile = document.querySelector("#import-file") as HTMLInputElement;

const submitButton = document.querySelector("#activate") as HTMLButtonElement | null;

// manual delete button
const manualDeleteButton = document.querySelector("#manual-delete") as HTMLButtonElement;

const regexSection = document.querySelector("#regex-clean-section") as HTMLDetailsElement;
const regexPatternInput = document.querySelector("#regex-pattern") as HTMLInputElement;
const regexPreviewButton = document.querySelector("#regex-preview") as HTMLButtonElement;
const regexDeleteButton = document.querySelector("#regex-delete") as HTMLButtonElement;
const regexStatus = document.querySelector("#regex-status") as HTMLParagraphElement;
const regexResults = document.querySelector("#regex-results") as HTMLDivElement;
const regexCount = document.querySelector("#regex-count") as HTMLSpanElement;
const regexInputWrap = document.querySelector("#regex-input-wrap") as HTMLDivElement;
const regexFlagIgnoreCase = document.querySelector("#regex-flag-i") as HTMLInputElement;
const regexFlagUnicode = document.querySelector("#regex-flag-u") as HTMLInputElement;
const regex101Link = document.querySelector("#regex-101") as HTMLAnchorElement;
const regexValidity = document.querySelector("#regex-validity") as HTMLSpanElement;
const regexSort = document.querySelector("#regex-sort") as HTMLSelectElement;
const regexHistoryWrap = document.querySelector("#regex-history-wrap") as HTMLDivElement;
const regexHistoryList = document.querySelector("#regex-history") as HTMLUListElement;
const regexHighlight = document.querySelector("#regex-highlight") as HTMLDivElement;
const regexResultsCard = document.querySelector("#regex-results-card") as HTMLDivElement;
const regexPopoutButton = document.querySelector("#regex-popout") as HTMLButtonElement;

const regexPopParams = new URLSearchParams(location.search);
if (regexPopParams.has("regexPop")) {
    document.body.classList.add("regex-popout");
    regexPatternInput.value = regexPopParams.get("pattern") ?? "";
    regexFlagIgnoreCase.checked = (regexPopParams.get("flags") ?? "").includes("i");
    regexFlagUnicode.checked = (regexPopParams.get("flags") ?? "").includes("u");
}

let regexPreviewedItems: RegexMatch[] = [];

let regexPreviewGen = 0;

const REGEX_RENDER_CHUNK = 200;

let regexHistoryWrite: Promise<void> = Promise.resolve();

function queueRegexHistoryUpdate(update: (entries: RegexHistoryEntry[]) => RegexHistoryEntry[]): void {
    regexHistoryWrite = regexHistoryWrite.then(async () => {
        const res = new Options(await browser.storage.local.get());
        await browser.storage.local.set({ regexHistory: update(res.regexHistory) });
    }).catch((error) => console.error("regexHistory update failed", error));
}

/**
 * Resets the trigger mode
 * Used when importing from file or sync
 * @param opts - The imported options to apply
 */
function resetTriggerMode(opts: Options) {
    // typically the trigger mode is initialized on startup or right as it's changed in the form
    // but if you import, the form is not updated and startup is not ran
    // so we have to reset the trigger mode manually
    const msg = new Message();

    switch (opts.deleteMode) {
        case "idle":
            msg.state = MessageState.SET_IDLE;
            msg.idleLength = opts.idleLength;
            break;
        case "startup":
            msg.state = MessageState.SET_STARTUP;
            break;
        case "timer":
            msg.state = MessageState.SET_TIMER;
            msg.timerInterval = opts.timerInterval;
            break;
    }

    browser.runtime.sendMessage(msg);
}

/**
 * Sends a message to the background script telling it to delete history
 */
function manualDelete(e: MouseEvent): void {
    e.preventDefault();

    const msg = new Message({ state: MessageState.DELETE });
    browser.runtime.sendMessage(msg);
}

function regexInvalidatePreview(): void {
    regexPreviewGen += 1;
    regexPreviewedItems = [];
    regexDeleteButton.disabled = true;
    regexStatus.innerText = "";
    regexResults.replaceChildren();
    regexResultsCard.style.display = "none";
}

function regexFlags(): string {
    let flags = "";
    if (regexFlagIgnoreCase.checked) {
        flags += "i";
    }
    if (regexFlagUnicode.checked) {
        flags += "u";
    }
    return flags;
}

function escapeSlashesForRegex101(pattern: string): string {
    let out = "";
    let escaped = false;
    for (const c of pattern) {
        if (escaped) {
            out += c;
            escaped = false;
            continue;
        }
        if (c === "\\") {
            out += c;
            escaped = true;
            continue;
        }
        out += c === "/" ? "\\/" : c;
    }
    return out;
}

function regexRefreshValidity(): void {
    const pattern = regexPatternInput.value;
    regex101Link.href = "https://regex101.com/?flavor=javascript&regex=" + encodeURIComponent(escapeSlashesForRegex101(pattern)) + "&flags=" + regexFlags();
    renderRegexTokens(regexHighlight, pattern);
    regexInputWrap.style.width = "clamp(240px, calc(" + (pattern.length + 1) + "ch + 40px), 100%)";
    regexHighlight.scrollLeft = regexPatternInput.scrollLeft;
    regexPatternInput.classList.remove("regex-valid", "regex-invalid");
    regexValidity.classList.remove("valid", "invalid");
    if (pattern === "") {
        regexPreviewButton.disabled = true;
        return;
    }
    try {
        new RegExp(pattern, regexFlags());
        regexPatternInput.classList.add("regex-valid");
        regexValidity.classList.add("valid");
        regexPreviewButton.disabled = false;
    } catch {
        regexPatternInput.classList.add("regex-invalid");
        regexValidity.classList.add("invalid");
        regexPreviewButton.disabled = true;
    }
}

function closeIconSvg(): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z");
    svg.append(path);
    return svg;
}

function regexGroupKey(url: string): string {
    try {
        const parsed = new URL(url);
        const segments = parsed.pathname.split("/").filter(part => part !== "");
        return segments.length > 0 ? parsed.origin + "/" + segments[0] : parsed.origin;
    } catch {
        return url;
    }
}

function buildResultRow(item: RegexMatch, prefix: string): HTMLLIElement {
    const li = document.createElement("li");
    const line = document.createElement("div");
    line.className = "regex-row-line";
    const path = document.createElement("span");
    path.className = "regex-row-path";
    const remainder = item.url.startsWith(prefix) ? item.url.slice(prefix.length) : item.url;
    path.innerText = remainder === "" ? "/" : remainder;
    line.append(path);
    const meta = document.createElement("span");
    meta.className = "regex-row-meta";
    meta.innerText = item.lastVisitTime > 0 ? item.visitCount + "x " + new Date(item.lastVisitTime).toLocaleDateString() : item.visitCount + "x";
    line.append(meta);
    li.append(line);
    const full = document.createElement("div");
    full.className = "regex-row-full";
    if (item.title !== "") {
        const title = document.createElement("div");
        title.innerText = item.title;
        full.append(title);
    }
    const url = document.createElement("div");
    url.innerText = item.url;
    full.append(url);
    if (item.lastVisitTime > 0) {
        const visited = document.createElement("div");
        visited.innerText = new Date(item.lastVisitTime).toLocaleString();
        full.append(visited);
    }
    li.append(full);
    li.addEventListener("click", () => li.classList.toggle("expanded"));
    return li;
}

function renderRegexResults(): void {
    regexResults.replaceChildren();
    const sorted = [...regexPreviewedItems];
    switch (regexSort.value) {
        case "visitCount":
            sorted.sort((a, b) => b.visitCount - a.visitCount);
            break;
        case "url":
            sorted.sort((a, b) => a.url.localeCompare(b.url));
            break;
        default:
            sorted.sort((a, b) => b.lastVisitTime - a.lastVisitTime);
            break;
    }
    const groups = new Map<string, RegexMatch[]>();
    for (const item of sorted) {
        const key = regexGroupKey(item.url);
        const bucket = groups.get(key);
        if (bucket === undefined) {
            groups.set(key, [item]);
        } else {
            bucket.push(item);
        }
    }
    const single = groups.size === 1;
    for (const [key, entries] of groups) {
        const group = document.createElement("details");
        group.open = single;
        const summary = document.createElement("summary");
        summary.innerText = key + " (" + entries.length + ")";
        group.append(summary);
        const list = document.createElement("ul");
        group.append(list);
        let renderedCount = 0;
        const renderEntries = () => {
            if (renderedCount >= entries.length) {
                return;
            }
            const moreRow = list.querySelector(".regex-show-more");
            if (moreRow !== null) {
                moreRow.remove();
            }
            const end = Math.min(renderedCount + REGEX_RENDER_CHUNK, entries.length);
            for (let i = renderedCount; i < end; i += 1) {
                list.append(buildResultRow(entries[i], key));
            }
            renderedCount = end;
            if (renderedCount < entries.length) {
                const li = document.createElement("li");
                li.className = "regex-show-more";
                li.innerText = browser.i18n.getMessage("regexCleanShowMore", [(entries.length - renderedCount).toString()]);
                li.addEventListener("click", (e) => {
                    e.stopPropagation();
                    renderEntries();
                });
                list.append(li);
            }
        };
        group.addEventListener("toggle", () => {
            if (group.open && renderedCount === 0) {
                renderEntries();
            }
        });
        if (group.open) {
            renderEntries();
        }
        regexResults.append(group);
    }
}

function recordRegexHistory(pattern: string, flags: string): void {
    queueRegexHistoryUpdate(entries => {
        const next = entries.filter(entry => entry.pattern !== pattern || entry.flags !== flags);
        next.unshift({ pattern, flags });
        return next.slice(0, 10);
    });
}

function renderRegexHistory(entries: RegexHistoryEntry[]): void {
    regexHistoryList.replaceChildren();
    regexHistoryWrap.style.display = entries.length === 0 ? "none" : "";
    for (const entry of entries) {
        const li = document.createElement("li");
        const use = document.createElement("button");
        use.type = "button";
        use.className = "regex-history-use";
        const patternSpan = document.createElement("span");
        renderRegexTokens(patternSpan, entry.pattern);
        use.append(patternSpan);
        if (entry.flags !== "") {
            const flagsSpan = document.createElement("span");
            flagsSpan.className = "regex-history-flags";
            flagsSpan.innerText = " /" + entry.flags;
            use.append(flagsSpan);
        }
        use.title = entry.flags === "" ? entry.pattern : entry.pattern + " /" + entry.flags;
        use.addEventListener("click", (e) => {
            e.preventDefault();
            regexPatternInput.value = entry.pattern;
            regexFlagIgnoreCase.checked = entry.flags.includes("i");
            regexFlagUnicode.checked = entry.flags.includes("u");
            regexInvalidatePreview();
            regexRefreshValidity();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "regex-history-remove";
        remove.title = browser.i18n.getMessage("regexCleanRemovePattern");
        remove.append(closeIconSvg());
        remove.addEventListener("click", (e) => {
            e.preventDefault();
            queueRegexHistoryUpdate(items => items.filter(item => item.pattern !== entry.pattern || item.flags !== entry.flags));
        });
        li.append(use, remove);
        regexHistoryList.append(li);
    }
}

async function regexPreview(e: MouseEvent): Promise<void> {
    e.preventDefault();
    regexInvalidatePreview();

    const gen = regexPreviewGen;
    const pattern = regexPatternInput.value;
    const flags = regexFlags();

    regexPreviewButton.disabled = true;
    let matches: RegexPreview;
    try {
        matches = await previewRegexClean(pattern, flags);
    } catch {
        if (gen === regexPreviewGen) {
            regexStatus.innerText = browser.i18n.getMessage("regexCleanSearchError");
        }
        return;
    } finally {
        regexRefreshValidity();
    }

    if (gen !== regexPreviewGen) {
        return;
    }

    recordRegexHistory(pattern, flags);

    if (matches.items.length === 0) {
        regexStatus.innerText = browser.i18n.getMessage("regexCleanNoMatches");
        if (matches.truncated) {
            regexStatus.innerText += " " + browser.i18n.getMessage("regexCleanTruncated", [REGEX_SEARCH_CAP.toString()]);
        }
        return;
    }

    regexPreviewedItems = matches.items;
    regexCount.innerText = browser.i18n.getMessage("regexCleanMatchCount", [matches.items.length.toString()]);
    if (matches.truncated) {
        regexCount.innerText += " " + browser.i18n.getMessage("regexCleanTruncated", [REGEX_SEARCH_CAP.toString()]);
    }
    regexResultsCard.style.display = "";
    renderRegexResults();
    regexDeleteButton.disabled = false;
}

async function regexPopout(e: MouseEvent): Promise<void> {
    e.preventDefault();
    const url = browser.runtime.getURL("popup.html") + "?regexPop=1&pattern=" + encodeURIComponent(regexPatternInput.value) + "&flags=" + regexFlags();
    await browser.windows.create({ url, type: "popup", width: 640, height: 720 });
    window.close();
}

async function regexDelete(e: MouseEvent): Promise<void> {
    e.preventDefault();
    if (regexPreviewedItems.length === 0) {
        return;
    }

    const count = regexPreviewedItems.length;
    regexDeleteButton.disabled = true;
    regexPreviewButton.disabled = true;
    let failed = false;
    try {
        await deleteUrls(regexPreviewedItems.map(item => item.url));
    } catch {
        failed = true;
    } finally {
        regexInvalidatePreview();
        regexRefreshValidity();
    }
    regexStatus.innerText = failed ? browser.i18n.getMessage("regexCleanDeleteError") : browser.i18n.getMessage("regexCleanDeleted", [count.toString()]);
}

/**
 * Upload current local storage to sync storage
 */
async function upload(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const res = new Options(await browser.storage.local.get());
    await browser.storage.sync.set(res);
    // location.reload();
}

/**
 * Download current sync storage to local storage
 *
 * Sets idle or startup based on the contents of the downloaded options
 */
async function download(e: MouseEvent): Promise<void> {
    e.preventDefault();

    const res = new Options(await browser.storage.sync.get());

    resetTriggerMode(res);

    browser.storage.local.set(res);
    // location.reload();
}

/**
 * Imports the config from a file.
 */
function importConfig() {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
            const importedConfig = new Options(JSON.parse(reader.result));

            resetTriggerMode(importedConfig);

            browser.storage.local.set(importedConfig);
        }
    });

    if (importFile.files !== null && importFile.files.length > 0) {
        reader.readAsText(importFile.files[0]);
    }
}

/**
 * Sets dirty flag in storage when extension is activated or behavior is changed
 * Extension will not activate until dirty flag is cleared, or browser is restarted
 * @param e event
 */
function markSettingsDirty(e?: Event): void {
    const target = e?.target as HTMLInputElement | undefined;

    if (target?.name === "behavior") {
        // if behavior is ENABLED, mark settings DIRTY
        //  history will not be cleared until settings are confirmed
        // if behavior is DISABLED, mark settings CLEAN
        //  since no destructive things can occur while disabled, don't need confirmation
        if (target.value !== "disable") {
            if (submitButton !== null) {
                submitButton.classList.add("ready");
                browser.storage.local.set({ dirty: true });
            }
        } else {
            markSettingsClean();
        }
    }
}

/**
 * Clears dirty flag in storage
 * Extension will activate when dirty flag is cleared
 */
function markSettingsClean(): void {
    submitButton?.classList.remove("ready");
    browser.storage.local.set({ dirty: false })
}

/**
 * Saves inputs on options page to storage
 *  * Runs when input is changed by user
 *  * If user input is not valid, does not save
 *  * Set idle or startup based on input
 * @param e event object
 */
async function save(e?: Event): Promise<void> {
    if (form.checkValidity()) {
        submitButton?.classList.remove("ready");

        const opts: OptionsInterface = {
            behavior: formElements.behavior.value,
            days: parseInt(formElements.days.value),
            deleteMode: formElements.deleteMode.value,
            idleLength: parseInt(formElements.idleLength.value),
            timerInterval: parseInt(formElements.timerInterval.value),
            notifications: formElements.notifications.checked,
            downloads: formElements.downloads.checked,
            regexClean: formElements.regexClean.checked,
            // filterHistory: formElements.filterHistory.checked,
            // filterList: formElements.filterList.value.split("\n"),

            lastRun: formElements.lastRun.value,

            icon: formElements.icon.value,
        };

        if (opts.behavior === "disable") {
            manualDeleteButton.disabled = true;
            console.log("Disabled");
        } else {
            manualDeleteButton.disabled = false;
            console.log("Enabled");
        }

        if (e !== undefined) {
            const target = e.target as HTMLFieldSetElement;

            // if changing the setting will update idle / startup
            const msg = new Message();
            if ((target.name === "idleLength" || target.name === "deleteMode") && opts.deleteMode === "idle") {
                msg.state = MessageState.SET_IDLE;
                msg.idleLength = opts.idleLength;
                browser.runtime.sendMessage(msg);
            } else if (target.name === "deleteMode" && opts.deleteMode === "startup") {
                msg.state = MessageState.SET_STARTUP;
                browser.runtime.sendMessage(msg);
            } else if ((target.name === "timerInterval" || target.name === "deleteMode") && opts.deleteMode === "timer") {
                msg.state = MessageState.SET_TIMER;
                msg.timerInterval = opts.timerInterval;
                browser.runtime.sendMessage(msg);
            } else if (target.name === "icon") {
                msg.state = MessageState.SET_ICON;
                msg.icon = opts.icon;
                browser.runtime.sendMessage(msg);
            }

            // const isNotificationPermissionGranted = await browser.permissions.contains({ permissions: ["notifications"] });
            // if (!isNotificationPermissionGranted) {
            //     opts.notifications = false;
            // }

            // const isDownloadPermissionGranted = await browser.permissions.contains({ permissions: ["downloads"] });
            // if (!isDownloadPermissionGranted) {
            //     opts.downloads = false;
            // }

            // if notifications were enabled
            // if (isNotificationPermissionGranted && target.name === "notifications" && opts.notifications) {
            //     browser.notifications.create({
            //         type: "basic",
            //         iconUrl: "icons/icon-96.png",
            //         title: browser.i18n.getMessage("notificationEnabled"),
            //         message: browser.i18n.getMessage("notificationEnabledBody")
            //     });
            // }
        }

        console.log("Saving", opts);

        // save options
        browser.storage.local.set(opts);
    }
}

/**
 * Runs on page load
 * Loads current options to inputs on page
 */
async function load(): Promise<void> {
    const res = new Options(await browser.storage.local.get());
    console.log("Loading", res);

    formElements.behavior.value = res.behavior.toString();
    formElements.days.value = res.days.toString();
    formElements.idleLength.value = res.idleLength.toString();
    formElements.timerInterval.value = res.timerInterval.toString();
    formElements.deleteMode.value = res.deleteMode;
    // formElements.filterHistory.checked = res.filterHistory;
    // formElements.filterList.value = res.filterList.join("\n");

    formElements.icon.value = res.icon;

    if (await browser.permissions.contains({ permissions: ["notifications"] })) {
        formElements.notifications.checked = res.notifications;
    } else {
        formElements.notifications.checked = false;
    }

    if (await browser.permissions.contains({ permissions: ["downloads"] })) {
        formElements.downloads.checked = res.downloads;
    } else {
        formElements.downloads.checked = false;
    }

    formElements.regexClean.checked = res.regexClean;
    regexSection.style.display = res.regexClean ? "" : "none";
    renderRegexHistory(res.regexHistory);

    if (res.behavior === "disable") {
        nextRun.innerText = browser.i18n.getMessage("statisticsNextRunDisable");
    } else if (res.dirty) {
        nextRun.innerText = browser.i18n.getMessage("statisticsUnsavedChanges");
        submitButton?.classList.add("ready");
    } else {
        const alarm = await browser.alarms.get("DeleteHistoryAlarm");
        if (res.deleteMode === "timer" && alarm !== undefined) {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunTimer", [ new Date(alarm.scheduledTime).toLocaleString() ]);
        }

        if (res.deleteMode === "idle") {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunIdle");
        }

        if (res.deleteMode === "startup") {
            nextRun.innerText = browser.i18n.getMessage("statisticsNextRunStartup");
        }
    }


    formElements.lastRun.value = res.lastRun;
    lastRunVisible.innerText = res.lastRun;

    if (res.behavior === "disable" || res.dirty) {
        manualDeleteButton.disabled = true;
    } else {
        manualDeleteButton.disabled = false;
    }

    // allow config to be exported
    exportButton.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res));
}

document.addEventListener("DOMContentLoaded", load);
// notificationRequestButton.getElement().addEventListener("click", togglePermission);
form.addEventListener("input", save);
form.addEventListener("input", markSettingsDirty);

submitButton?.addEventListener("click", markSettingsClean);
form.addEventListener("submit", save);
form.addEventListener("submit", markSettingsClean);

manualDeleteButton.addEventListener("click", manualDelete);

formElements.notifications.addEventListener("change", (e) => PermissionCheckbox(["notifications"], e, save));
formElements.downloads.addEventListener("change", (e) => PermissionCheckbox(["downloads"], e, save));

uploadButton.addEventListener("click", upload);
downloadButton.addEventListener("click", download);

importButton.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", importConfig);

function regexOnEdit(e: Event): void {
    e.stopPropagation();
    regexInvalidatePreview();
    regexRefreshValidity();
}

regexPatternInput.addEventListener("input", regexOnEdit);
regexPatternInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (!regexPreviewButton.disabled) {
            regexPreviewButton.click();
        }
    }
});
regexFlagIgnoreCase.addEventListener("input", regexOnEdit);
regexFlagUnicode.addEventListener("input", regexOnEdit);
regexSort.addEventListener("input", (e) => {
    e.stopPropagation();
    renderRegexResults();
});
regexRefreshValidity();
regexPreviewButton.addEventListener("click", regexPreview);
regexDeleteButton.addEventListener("click", regexDelete);
regexPopoutButton.addEventListener("click", regexPopout);
regexPatternInput.addEventListener("scroll", () => {
    regexHighlight.scrollLeft = regexPatternInput.scrollLeft;
});

browser.storage.onChanged.addListener(load);
