export interface OptionsInterface {
    days: number;
    idleLength: number;
    deleteMode: "idle" | "startup" | string;
    notifications: boolean;
}

export class Options implements OptionsInterface {
    days = 0;
    idleLength = 60;
    deleteMode = "idle";
    notifications = false;

    constructor(optionsObj?: Partial<OptionsInterface>) {
        this.setDays(optionsObj?.days);
        this.setIdleLength(optionsObj?.idleLength);
        this.setDeleteMode(optionsObj?.deleteMode);
        this.setNotifications(optionsObj?.notifications);
    }

    setDays(d?: number): void {
        if (typeof d === "number" && d > 0) {
            this.days = d;
        }
    }

    setIdleLength(i?: number): void {
        if (typeof i === "number" && i >= 15) {
            this.idleLength = i;
        }
    }

    setDeleteMode(d?: string): void {
        if (typeof d === "string") {
            this.deleteMode = d;
        }
    }

    setNotifications(n?: boolean): void {
        if (typeof n === "boolean") {
            this.notifications = n;
        }
    }
}
