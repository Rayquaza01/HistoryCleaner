import { Browser } from "webextension-polyfill";

declare global {
    const chrome: Browser;
    const browser: Browser;
}
