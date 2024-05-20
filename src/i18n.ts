/**
 * Loads i18n text to page
 *
 * Affects innerText of elements with class i18n
 *
 * Elements must have dataset.i18n present with the id of the i18n string
 */
export function i18n(): void {
    ([...document.getElementsByClassName("i18n")] as HTMLElement[])
        .forEach(item => {
            if (typeof item.dataset.i18n === "string") {
                item.innerText = browser.i18n.getMessage(item.dataset.i18n);
            }
        });
}
