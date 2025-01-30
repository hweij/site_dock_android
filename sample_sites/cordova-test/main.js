// @ts-check

function getRootDir() {
    const loc = window.location;
    console.log("LOCATION");
    console.log(loc);
    return loc.href.replace("/index.html", "/");
}

function loadStringAsset(fpath) {
    return loadLocalAsset(fpath, "string");
}

function loadDataAsset(fpath) {
    return loadLocalAsset(fpath, "buffer");
}

/**
 *
 * @param {string} fpath
 * @param {"string" | "buffer"} format;
 */
function loadLocalAsset(fpath, format) {
    console.log("Window props:")
    if (_cordovaActive) {
        console.log(`Cordova present`);
        console.log(cordova);
        corLoadLocalFile(getRootDir() + fpath, format);
    }
    else {
        console.log("Cordova not present");
    }
}

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var _cordovaActive = false;

function onDeviceReady() {
    _cordovaActive = true;
    console.log("Device ready");
    loadStringAsset("index.html");
}

/**
 *
 * @param {string} fpath
 * @param {"string" | "buffer"} format;
 */
function corLoadLocalFile(fpath, format) {
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
                    console.log(this.result);
                }

                reader.onerror = function (e) {
                    console.log(`Error for`);
                    console.log(this.result);
                }

                if (format === "buffer") {
                    reader.readAsArrayBuffer(file);
                }
                else {
                    reader.readAsText(file);
                }
            });
            }
        },
        err => { console.log("fail"); console.log(err); });
}