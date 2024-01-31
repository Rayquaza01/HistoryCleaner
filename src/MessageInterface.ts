/** Possible states for a message */
export enum MessageState {
    INVALID = -1,
    DELETE,
    SET_IDLE,
    SET_STARTUP
}

/** Shape of message */
export interface MessageInterface {
    state: MessageState
    idleLength: number;
}

/** Creates Message object */
export class Message implements MessageInterface {
    state: MessageState;
    idleLength: number;

    constructor(msgObj?: Partial<MessageInterface>) {
        this.state = msgObj?.state ?? -1;
        this.idleLength = msgObj?.idleLength ?? -1;
    }
}
