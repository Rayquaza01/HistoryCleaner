import Browser from "webextension-polyfill";

declare global {
    const browser: typeof Browser;
    const chrome: typeof Browser;
}
