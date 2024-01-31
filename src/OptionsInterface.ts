import browser from "webextension-polyfill";

/** Shape of options object */
export interface OptionsInterface {
    behavior: "disable" | "days" | "all" | string;
    days: number;
    idleLength: number;
    deleteMode: "idle" | "startup" | string;
    notifications: boolean;
    // filterHistory: boolean;
    // filterList: string[];

    // statistics
    lastRun: string;
}

export interface FormElements extends HTMLFormControlsCollection {
    behavior: RadioNodeList;
    days: HTMLInputElement;
    idleLength: HTMLInputElement;
    deleteMode: RadioNodeList;
    notifications: HTMLInputElement;
    // filterHistory: HTMLInputElement;
    // filterList: HTMLTextAreaElement;

    // statistics
    lastRun: HTMLInputElement;
    deleteCount: HTMLInputElement;
}

/** Creates Options object */
export class Options implements OptionsInterface {
    behavior = "disable";
    days = 0;
    idleLength = 60;
    deleteMode = "idle";
    notifications = false;
    // filterHistory = false
    // filterList = ["example.com", "example.org"]

    lastRun = browser.i18n.getMessage("lastRunNever");
    deleteCount = 0;

    /**
     * Creates default options object, with overrides from optionsObj
     * @param optionsObj Initial options object, likely from storage
     */
    constructor(optionsObj?: Record<string, unknown>) {
        if (optionsObj === undefined) {
            return;
        }

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

        if (typeof optionsObj.deleteMode === "string" && ["idle", "startup"].includes(optionsObj.deleteMode)) {
            this.deleteMode = optionsObj.deleteMode;
        }

        if (typeof optionsObj.notifications === "boolean") {
            this.notifications = optionsObj.notifications;
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
    }
}
