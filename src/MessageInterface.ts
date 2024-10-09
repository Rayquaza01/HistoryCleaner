/** Possible states for a message */
export enum MessageState {
    INVALID = -1,
    DELETE,
    SET_IDLE,
    SET_STARTUP,
    SET_TIMER,
    SET_ICON,
}

/** Shape of message */
export interface MessageInterface {
    state: MessageState;
    idleLength: number;
    timerInterval: number;
    icon: string;
}

/** Creates Message object */
export class Message implements MessageInterface {
    state: MessageState;
    idleLength: number;
    timerInterval: number;
    icon: string;

    constructor(msgObj?: Partial<MessageInterface>) {
        this.state = msgObj?.state ?? -1;
        this.idleLength = msgObj?.idleLength ?? -1;
        this.timerInterval = msgObj?.timerInterval ?? -1;
        this.icon = msgObj?.icon ?? "theme";
    }
}
