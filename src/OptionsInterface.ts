export interface OptionsInterface {
    days?: number;
    idleLength?: number;
    deleteMode?: "idle" | "startup" | string;
    notifications?: boolean;
}

export const DefaultOptions: OptionsInterface = {
    days: 0,
    idleLength: 60,
    deleteMode: "idle",
    notifications: false
};
