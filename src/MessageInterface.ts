export enum MessageState {
    DELETE,
    SET_IDLE,
    SET_STARTUP
}

export interface MessageInterface {
    state: MessageState
    idleLength: number;
}

export class Message implements MessageInterface {
    state: MessageState;
    idleLength: number;

    constructor(msgObj?: Partial<MessageInterface>) {
        msgObj ??= {};

        this.state = msgObj.state ?? -1;
        this.idleLength = msgObj.idleLength ?? -1;
    }
}
