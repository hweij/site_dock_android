// @ts-check

function getRootDir() {
    const loc = window.location;
    console.log("LOCATION");
    console.log(loc);
    return loc.href.replace("/index.html", "/");
}

/**
 * @param {string} fpath
 */
function loadTextAsset(fpath) {
    if (_cordovaActive) {
        return loadLocalAsset(fpath, "string");
    }
    else {
        return fetch(fpath).then(res => res.text());
    }
}

function loadBufferAsset(fpath) {
    if (_cordovaActive) {
        return loadLocalAsset(fpath, "buffer");
    }
    else {
        return fetch(fpath).then(res => res.arrayBuffer());
    }
}

/**
 *
 * @param {string} fpath
 * @param {"string" | "buffer"} format;
 */
async function loadLocalAsset(fpath, format) {
    const res = corLoadLocalFile(getRootDir() + fpath, format);
    return res;
}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var _cordovaActive = false;

function onDeviceReady() {
    _cordovaActive = true;
    console.log("Device ready");
    console.log("Load asset TEST");
    loadTextAsset("index.html").then((v) => console.log(v));
}

/**
 *
 * @param {string} fpath
 * @param {"string" | "buffer"} format;
 */
function corLoadLocalFile(fpath, format) {
    return new Promise(
        /**
         * @param {(v: string | ArrayBuffer) => void} resolve
         * @param {(v: string) => void} reject
         */
        (resolve, reject) => {
            console.log(`Loading local file ${fpath}`);
            window.resolveLocalFileSystemURL(
                fpath,
                e => {
                    if (e.isFile) {
                        /** @type FileEntry */(e).file(file => {
                        console.log("success"); console.log(e);

                        var reader = new FileReader();

                        reader.onloadend = function (e) {
                            if (format === "buffer") {
                                console.log("Read binary file");
                            }
                            else {
                                console.log("Read text file");
                            }
                            if (this.result !== null) {
                                resolve(this.result);
                            }
                            else {
                                reject("Received empty result");
                            }
                        }

                        reader.onerror = function (e) {
                            console.log(`Error for`);
                            console.log(this.result);
                            reject(`Error reading file ${fpath}`);
                        }

                        if (format === "buffer") {
                            reader.readAsArrayBuffer(file);
                        }
                        else {
                            reader.readAsText(file);
                        }
                    });
                    }
                    else {
                        reject(`Incorrect file: ${fpath}`);
                    }
                },
                err => {
                    console.log("fail");
                    console.log(err);
                    reject(`Error reading file ${fpath}`);
                });
        }
    );
}