/**
 * @class
 * Manages toggling an HTMLButton between two states
 */
export class ToggleButton {
    private element: HTMLButtonElement;
    private textOptions: string[];
    private state: number;

    /**
     * @param element - the HTMLButton element
     * @param textOptions - An array of text options for the button
     */
    constructor(element: HTMLButtonElement, textOptions: string[]) {
        this.element = element;
        this.textOptions = textOptions;
        this.state = 0;
        this.element.innerText = this.textOptions[this.state];
    }

    /** Get the state of the button */
    getState(): number {
        return this.state;
    }

    /** Set the state of the button */
    setState(state: number): void {
        this.state = state;
        this.element.innerText = this.textOptions[this.state];
    }

    /** Get the button element */
    getElement(): HTMLButtonElement {
        return this.element;
    }
}
