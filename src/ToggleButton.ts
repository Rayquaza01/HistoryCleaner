/**
 * @class
 * Manages toggling an HTMLButton between two states
 */
export class ToggleButton {
    private element: HTMLButtonElement;
    private textOptions: string[];
    private buttonState: number;

    /**
     * @param element - the HTMLButton element
     * @param textOptions - An array of text options for the button
     */
    constructor(element: HTMLButtonElement, textOptions: string[]) {
        this.element = element;
        this.textOptions = textOptions;
        this.buttonState = 0;
        this.element.innerText = this.textOptions[this.buttonState];
    }

    /** Get the state of the button */
    get state(): number {
        return this.buttonState;
    }

    /** Set the state of the button */
    set state(state: number) {
        this.buttonState = state;
        this.element.innerText = this.textOptions[this.buttonState];
    }

    /** Get the button element */
    get getElement() {
        return this.element;
    }
}
