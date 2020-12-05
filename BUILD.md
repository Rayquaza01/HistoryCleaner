# Building History Cleaner 1.2.4

## System Info
 * Ubuntu 20.10
 * node 12.19.0
 * npm 6.14.9
 * bash 5.0.17
 * For tool and library versions, check package.json

# Building

To build the extension, run:
```shell
# Install node modules and build buildscript
# Only needs to be done after updating the repo
npm install
npm run build:buildscript

# Build the extension
# Moves / bundles assets to dist
npm run build:prod

# Zip extension for distribution
npm run build:extension
```
The built files will be in `./dist` and the complete extension will be `./web-ext-artifacts/history_cleaner-1.3.0.zip`

# Testing the extension

To test the extension, run:
```shell
npm run build:dev
```
This will build the extension to `./dist` and rebuild it on file changes. `./dist` can be loaded as a temporary extension in Chrome or Firefox.
