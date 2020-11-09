export interface MessageInterface {
    state: "delete" | "setidle" | "setstartup";
    data?: number;
}
