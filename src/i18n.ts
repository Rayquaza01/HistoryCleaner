import { browser } from "webextension-polyfill-ts";

export function i18n() {
    ([...document.getElementsByClassName("i18n")] as HTMLElement[])
        .forEach(item => {
            item.innerText = browser.i18n.getMessage(item.dataset.i18n)
        });
}
