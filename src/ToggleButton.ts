export class ToggleButton {
    private element: HTMLButtonElement;
    private textOptions: string[];
    private state: number;

    constructor(element: HTMLButtonElement, textOptions: string[]) {
        this.element = element;
        this.textOptions = textOptions;
        this.state = 0;
        this.element.innerText = this.textOptions[this.state];
    }

    get getState() {
        return this.state;
    }

    set setState(state: number) {
        this.state = state;
        this.element.innerText = this.textOptions[this.state];
    }

    get getElement() {
        return this.element;
    }
}
