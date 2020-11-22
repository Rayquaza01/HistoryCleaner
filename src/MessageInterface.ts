export enum MessageState {
    DELETE,
    SET_IDLE,
    SET_STARTUP
}

export interface MessageInterface {
    state: MessageState
    data?: number;
}
