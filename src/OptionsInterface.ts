import browser from "./we";

/** Shape of options object */
export interface OptionsInterface extends Record<string, unknown> {
    behavior: "disable" | "days" | "all" | string;
    days: number;
    idleLength: number;
    timerInterval: number;
    deleteMode: "idle" | "startup" | "timer" | string;
    notifications: boolean;
    downloads: boolean;
    // filterHistory: boolean;
    // filterList: string[];

    // statistics
    lastRun: string;

    icon: "theme" | "icon_circle" | "icon_square" | "icon_circle_gradient" | "icon_square_gradient" | string;
}

export interface FormElements extends HTMLFormControlsCollection {
    behavior: RadioNodeList;
    days: HTMLInputElement;
    idleLength: HTMLInputElement;
    timerInterval: HTMLInputElement;
    deleteMode: RadioNodeList;
    notifications: HTMLInputElement;
    // notificationsPermission: HTMLInputElement;
    downloads: HTMLInputElement;
    // downloadsPermission: HTMLInputElement;
    // filterHistory: HTMLInputElement;
    // filterList: HTMLTextAreaElement;

    // statistics
    lastRun: HTMLInputElement;
    deleteCount: HTMLInputElement;

    icon: HTMLSelectElement
}

/** Creates Options object */
export class Options implements OptionsInterface {
    behavior = "disable";
    days = 0;
    idleLength = 60;
    timerInterval = 1440;
    deleteMode = "timer";
    notifications = false;
    downloads = false;
    icon = "theme";
    // filterHistory = false
    // filterList = ["example.com", "example.org"]

    lastRun = browser.i18n.getMessage("lastRunNever");
    deleteCount = 0;

    [key: string]: unknown

    /**
     * Creates default options object, with overrides from optionsObj
     * @param optionsObj Initial options object, likely from storage
     */
    constructor(optionsObj?: Record<string, unknown>) {
        if (optionsObj === undefined) {
            return;
        }

        const manifest_version = browser.runtime.getManifest().manifest_version;

        if (typeof optionsObj.behavior === "string" && ["disable", "days", "all"].includes(optionsObj.behavior)) {
            this.behavior = optionsObj.behavior;
        } else {
            if (typeof optionsObj.days === "number" && optionsObj.days > 0) {
                this.behavior = "days";
            }
        }

        if (typeof optionsObj.days === "number" && optionsObj.days >= 0) {
            this.days = optionsObj.days;
        }

        if (typeof optionsObj.idleLength === "number" && optionsObj.idleLength >= 15) {
            this.idleLength = optionsObj.idleLength;
        }

        if (typeof optionsObj.timerInterval === "number" && optionsObj.timerInterval >= 1) {
            this.timerInterval = optionsObj.timerInterval;
        }

        if (typeof optionsObj.deleteMode === "string" && ["idle", "startup", "timer"].includes(optionsObj.deleteMode)) {
            this.deleteMode = optionsObj.deleteMode;
        }

        // if set to idle on manifest v3, switch to timer
        if (manifest_version === 3 && this.deleteMode === "idle") {
            this.deleteMode = "timer";
        }

        if (typeof optionsObj.notifications === "boolean") {
            this.notifications = optionsObj.notifications;
        }

        if (typeof optionsObj.downloads === "boolean") {
            this.downloads = optionsObj.downloads;
        }

        // if (typeof optionsObj.filterHistory === "boolean") {
        //     this.filterHistory = optionsObj.filterHistory;
        // }

        // if (Array.isArray(optionsObj.filterList) && optionsObj.filterList.every(item => typeof item === "string")) {
        //     this.filterList = optionsObj.filterList;
        // }

        if (typeof optionsObj.lastRun === "string") {
            this.lastRun = optionsObj.lastRun;
        }

        if (typeof optionsObj.icon === "string") {
            this.icon = optionsObj.icon;
        }

        if (manifest_version === 3 && this.icon === "theme") {
            this.icon = "icon_circle_gradient";
        }
    }
}
