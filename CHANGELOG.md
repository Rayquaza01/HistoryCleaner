v1.5.0 Changelog

* Redesigned options UI
    * Options UI now respects colorscheme
    * Added import/export to file buttons
    * Added icons
    * Additional information on options UI
        * Displays when the extension last ran and the cutoff date
        * Displays when the extension will next run
* Options are now available through a toolbar button
* Added timer trigger mode
    * Timer mode causes history to be deleted on a set interval
    * Might be made default in future version
        * See: [#30 Manifest v3 (Chrome) - Idle Trigger](https://github.com/Rayquaza01/HistoryCleaner/issues/30)
* New required permission: notifications
    * Previously was an optional permission
    * If you set the notifications option, you will get a notification whenever history is cleared
    * Not notifications will be sent otherwise
* New required permission: alarms
    * Required for timer trigger mode
