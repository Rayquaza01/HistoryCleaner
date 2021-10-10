/** Shape of options object */
export interface OptionsInterface {
    days: number;
    idleLength: number;
    deleteMode: "idle" | "startup" | string;
    notifications: boolean;
}

/** Creates Options object */
export class Options implements OptionsInterface {
    days = 0;
    idleLength = 60;
    deleteMode = "idle";
    notifications = false;

    /**
     * Creates default options object, with overrides from optionsObj
     * @param optionsObj Initial options object, likely from storage
     */
    constructor(optionsObj?: Partial<OptionsInterface>) {
        this.setDays(optionsObj?.days);
        this.setIdleLength(optionsObj?.idleLength);
        this.setDeleteMode(optionsObj?.deleteMode);
        this.setNotifications(optionsObj?.notifications);
    }

    // Setters
    // Ensure given values are correct type and within valid ranges

    /**
     * Set days option
     * @param d Number of days (>= 0)
     */
    setDays(d?: number): void {
        if (typeof d === "number" && d >= -1) {
            this.days = d;
        }
    }

    /**
     * Set idleLength option
     * @param i Idle length in seconds (>= 15)
     */
    setIdleLength(i?: number): void {
        if (typeof i === "number" && i >= 15) {
            this.idleLength = i;
        }
    }

    /**
     * Set deleteMode option
     * @param d One of **idle** or **startup**
     */
    setDeleteMode(d?: string): void {
        if (typeof d === "string") {
            this.deleteMode = d;
        }
    }

    /**
     * Set notifications option
     * @param n Enabled or disabled (bool)
     */
    setNotifications(n?: boolean): void {
        if (typeof n === "boolean") {
            this.notifications = n;
        }
    }
}
