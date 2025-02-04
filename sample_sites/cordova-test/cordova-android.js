// @ts-check

// import { addScript as loadCordova } from "./android-cordova.js";

const CORDOVA_FILE_LOCATION = "file:///android_asset/www/cordova.js";

/**
 * Initialize site dock support by attempting to load and initialize Cordova.
 *
 * This function will attempt to:
 * 1. Load the cordova.js include file
 * 2. If found, initialize cordova and wait for it to finish
 * 3. If this app uses the "file:" protocol, redirect fetches to local file loads
 *
 * @param {string} [cordovaIncludeLocation] Optional location of the cordova.js include to bypass the default
 */
export async function initCordova(cordovaIncludeLocation) {
    let success = false;
    if (!cordovaIncludeLocation) {
        cordovaIncludeLocation = window.location.protocol === "file:"
            ? CORDOVA_FILE_LOCATION
            : "cordova.js"
    }
    try {
        await loadCordovaIncludeFile(cordovaIncludeLocation);
        // Check if cordova is known and, if so, initialize
        if (cordova) {
            LOG("Cordova loaded, initializing..");
            success = await waitForDevice();
            if (success) {
                LOG("succeeded");
            }
            else {
                LOG("failed")
            }
        }
    }
    catch (e) {
        console.log(e);
    }
    return success;
}

function waitForDevice() {
    return new Promise(
        /**
         *
         * @param {(b: boolean) => void} resolve
         */
        (resolve, _reject) => {
            const onDeviceReady = () => {
                LOG("Cordova device ready");
                // Redirect file, only if the file protocol is being used
                // For http(s) there is not need since fetch will work.
                if (window.location.protocol === "file:") {
                    console.log(`Using protocol ${window.location.protocol}, redirecting fetch operations`);
                    redirectFetch();
                }
                resolve(true);
            }

            try {
                if (cordova) {
                    // Wait for the deviceready event before using any of Cordova's device APIs.
                    document.addEventListener('deviceready', onDeviceReady, false);
                }
            }
            catch (e) {
                LOG("Cordova device not initialized");
                resolve(false);
            }
        });
}

/**
 * Redirect fetch if running in Cordova mode. All file fetches will be
 * served by a local file.
 */
function redirectFetch() {
    window.fetch = new Proxy(window.fetch, {
        apply: function (target, that, args) {
            // args holds argument of fetch function
            // Do whatever you want with fetch request
            console.log("fetch");
            console.log(args);
            if (!args[0].startsWith("http")) {
                console.log(`File fetch [${args[0]}]`);
                return new Promise((accept, _reject) => {
                    loadLocalFile(args[0]).then(buffer => accept(new Response(buffer, { status: 200, statusText: "OK" })));
                });
            }
            let temp = target.apply(that, args);
            temp.then((res) => {
                // After completion of request
                console.log(res);
            });
            return temp;
        },
    });
}

export function getRootDir() {
    const loc = window.location;
    LOG("LOCATION");
    LOG(loc);
    return loc.href.replace("/index.html", "/");
}

function LOG(s) {
    console.log(s);
}

/**
 * Loads a buffer using the file protocol.
 * Note: can only be called if Cordova has been successfully initialized.
 * @param {string} fpath
 */
function loadLocalFile(fpath) {
    return new Promise(
        /**
         * @param {(v: ArrayBuffer) => void} resolve
         * @param {(v: string) => void} reject
         */
        (resolve, reject) => {
            corLoadLocalFile(fpath, "buffer",
                v => {
                    if (v instanceof ArrayBuffer) {
                        resolve(v);
                    }
                    else {
                        throw new Error("Unexpected return type");
                    }
                },
                err => {
                    reject(err);
                }
            );
        }
    );
}

/**
 * @param {string} rpath
 * @param {"string" | "buffer"} format
 * @param {(v: string | ArrayBuffer) => void} cb
 * @param {(v: string) => void} err
 */
function corLoadLocalFile(rpath, format, cb, err) {
    const fpath = getRootDir() + rpath;
    LOG(`Loading local file ${fpath}`);
    window.resolveLocalFileSystemURL(
        fpath,
        e => {
            if (e.isFile) {
                /** @type FileEntry */(e).file(
                file => {
                    LOG("success"); LOG(e);

                    var reader = new FileReader();

                    reader.onloadend = function (e) {
                        if (this.result !== null) {
                            cb(this.result);
                        }
                        else {
                            err("Received empty result");
                        }
                    }

                    reader.onerror = function (e) {
                        LOG(`Error for`);
                        LOG(this.result);
                        err(`Error reading file ${fpath}`);
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
                err(`Incorrect file: ${fpath}`);
            }
        },
        e => {
            LOG("fail");
            LOG(e);
            err(`Error reading file ${fpath}`);
        });
}

/**
 * Attempts to load Cordova by inserting the script in the HTML-header.
 * @param {string} cordovaIncludeLocation
 */
async function loadCordovaIncludeFile(cordovaIncludeLocation) {
    return new Promise(
        /**
         * @param {(undefined) => void} resolve
         * @param {(err: string) => void} reject
         */
        (resolve, reject) => {
            const script = document.createElement('script');
            script.src = cordovaIncludeLocation;

            script.onload = resolve

            script.onerror = () => {
                reject('Cordova script load failed');
            };

            document.head.appendChild(script);
        }
    );
}
