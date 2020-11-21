export enum MessageState {
    DELETE = 0,
    SET_IDLE = 1,
    SET_STARTUP = 2
}

export interface MessageInterface {
    state: MessageState
    data?: number;
}
