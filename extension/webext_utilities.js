function generateElementsVariable(list) {
    // generate an object with elements based on a list of ids
    let dom = {};
    for (let item of list) {
        dom[item] = document.getElementById(item);
    }
    return dom;
}

function defaultValues(object, settings) {
    // initialize object with values.
    for (let key in settings) {
        if (!object.hasOwnProperty(key)) {
            object[key] = settings[key];
        }
    }
    return object;
}

function getContext() {
    // return the context of the current view
    return browser.extension.getViews({type: "popup"}).indexOf(window) > -1 ? "popup" :
        browser.extension.getViews({type: "sidebar"}).indexOf(window) > -1 ? "sidebar" :
            browser.extension.getViews({type: "tab"}).indexOf(window) > -1 ? "tab" : undefined;
}
