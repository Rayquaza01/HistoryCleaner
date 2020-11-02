# Building History Cleaner 1.2.4

## System Info
 * Ubuntu 20.10
 * node 12.19.0
 * npm 6.14.8
 * bash 5.0.17
 * For tool and library versions, check package.json

# Building

To build the extension, run:
```shell
npm install
npm run build:complete
```
The built files will be in `./dist` and the complete extension will be `./web-ext-artifacts/history_cleaner-1.2.4.zip`

# Testing the extension

To test the extension, run:
```shell
npm run watch:extension
```
This will build the extension to `./dist` and rebuild it on file changes. `./dist` can be loaded as a temporary extension in Chrome or Firefox.
