# Building History Cleaner 1.4.0

## System Info
 * Ubuntu 21.04
 * node v14.18.1
 * npm 8.0.0
 * bash 5.1.4
 * For tool and library versions, check package.json

# Building

To build the extension, run:
```shell
# Install node modules
npm install

# Build the extension
# Moves / bundles assets to dist
npm run build:prod

# Zip extension for distribution
npm run build:extension
```
The built files will be in `./dist` and the complete extension will be `./web-ext-artifacts/history_cleaner-1.4.0.zip`

# Testing the extension

To test the extension, run:
```shell
npm run build:dev
```
This will build the extension to `./dist` and rebuild it on file changes. `./dist` can be loaded as a temporary extension in Chrome or Firefox.
