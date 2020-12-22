import { browser } from "webextension-polyfill-ts";

export function i18n(): void {
    ([...document.getElementsByClassName("i18n")] as HTMLElement[])
        .forEach(item => {
            if (typeof item.dataset.i18n === "string") {
                item.innerText = browser.i18n.getMessage(item.dataset.i18n);
            }
        });
}
