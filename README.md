# HistoryCleaner
[![](https://img.shields.io/amo/v/history-cleaner)](https://addons.mozilla.org/en-US/firefox/addon/history-cleaner/)
[![](https://img.shields.io/chrome-web-store/v/epoabannnmjdknejdggkgjoebomipene)](https://chrome.google.com/webstore/detail/history-cleaner/epoabannnmjdknejdggkgjoebomipene/)

Firefox addon that deletes history older than a specified amount of days.

## Options

* Behavior
    * Decides what history the extension will delete when it triggers.
    * Either disabled, delete old history, or delete all history.
    * Defaults to disabled, so the extension doesn't do anything until you configure it.
* Number of Days to Keep History
    * Delete history older than midnight on the specified number of days ago.
    * Only has effect if behavior is set to delete old history.
    * Defaults to 0.
* Trigger Mode
    * Whether the extension triggers on idle, on browser startup, or at a set interval.
    * Defaults to idle.
* Idle Length
    * Amount of time in seconds the browser should idle before triggering.
    * Only has effect if trigger mode is set to idle.
    * Defaults to 60, minimum 15.
* Timer Interval
    * Interval in minutes between triggering.
    * Only has effect if trigger mode is set to timer.
    * Defaults to 1440 (24 hours), Minimum 1

## Permissions

* `history`
    * Used to clear browser history
* `storage`
    * Used to save user options
* `idle`
    * Used to detect when the browser is idle for the idle trigger mode
* `notifications`
    * Used to send a notification when history is cleared
    * Notifications are only sent if the user enables notifications in options
* `alarms`
    * Used to set a timer for the timer trigger mode.

## Building and Running

Clone this repository, and run `npm install` to install necessary dependencies and build tools.

* `npm run build:dev` will build the extension in watch mode for development.
* `npm run build:prod` will build the extension for production.
* `npm run firefox` will load `./dist/` as a temporary extension in Firefox.

## Acknowledgements

Icons used in History Cleaner are from [Pictogrammers](https://pictogrammers.com/), formerly Material Design Icons. ([Pictogrammers Free License](https://pictogrammers.com/docs/general/license/))

## Links

[![](https://raw.githubusercontent.com/Rayquaza01/HistoryCleaner/master/src/icons/amo.png)](https://addons.mozilla.org/en-US/firefox/addon/history-cleaner/)
[![](https://raw.githubusercontent.com/Rayquaza01/HistoryCleaner/master/src/icons/cws.png)](https://chrome.google.com/webstore/detail/history-cleaner/epoabannnmjdknejdggkgjoebomipene/)
