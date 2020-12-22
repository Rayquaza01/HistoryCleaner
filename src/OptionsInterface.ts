export interface OptionsInterface {
    days: number;
    idleLength: number;
    deleteMode: "idle" | "startup" | string;
    notifications: boolean;
}

export class Options implements OptionsInterface {
    days: number;
    idleLength: number;
    deleteMode: "idle" | "startup" | string;
    notifications: boolean;

    constructor(optionsObj?: Partial<OptionsInterface>) {
        optionsObj ??= {};

        this.days = optionsObj.days ?? 0;
        this.idleLength = optionsObj.idleLength ?? 60;
        this.deleteMode = optionsObj.deleteMode ?? "idle";
        this.notifications = optionsObj.notifications ?? false;
    }
}
