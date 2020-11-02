/**
 * @class
 * Manages toggling an HTMLButton between two states
 */
export class ToggleButton {
    private element: HTMLButtonElement;
    private textOptions: string[];
    private _state: number;

    /**
     * @param element - the HTMLButton element
     * @param textOptions - An array of text options for the button
     */
    constructor(element: HTMLButtonElement, textOptions: string[]) {
        this.element = element;
        this.textOptions = textOptions;
        this._state = 0;
        this.element.innerText = this.textOptions[this._state];
    }

    /** Get the state of the button */
    get state(): number {
        return this._state;
    }

    /** Set the state of the button */
    set state(state: number) {
        this._state = state;
        this.element.innerText = this.textOptions[this._state];
    }

    /** Get the button element */
    get getElement() {
        return this.element;
    }
}
