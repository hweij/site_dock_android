// @ts-check

var _cordovaActive = false;

function initCordova() {
    return new Promise(
        /**
         *
         * @param {(b: boolean) => void} resolve
         */
        (resolve, _reject) => {
            const onDeviceReady = () => {
                _cordovaActive = true;
                LOG("Running as Cordova app");
                redirectFetch();
                resolve(true);
            }

            try {
                if (cordova) {
                    // Wait for the deviceready event before using any of Cordova's device APIs.
                    // See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
                    document.addEventListener('deviceready', onDeviceReady, false);
                }
            }
            catch (e) {
                LOG("Running as website");
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
                return new Promise((accept, reject) => {
                    // TODO: create a proper response, not just a text string in the bodyInit
                    // Make sure it works for all assets (fonts, audio, etc.)
                    // Set proper status, etc.
                    loadBufferAsset(args[0]).then(buffer => accept(new Response(buffer, { status: 200, statusText: "OK" })));
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

function getRootDir() {
    const loc = window.location;
    LOG("LOCATION");
    LOG(loc);
    return loc.href.replace("/index.html", "/");
}

function LOG(s) {
    const win = document.getElementById("divLogs");
    if (win) {
        win.insertAdjacentText("beforeend", `${s}\n`);
    }
    console.log(s);
}

/**
 * @param {string} fpath
 */
function loadTextAsset(fpath) {
    if (_cordovaActive) {
        return new Promise(
            /**
             * @param {(v: string) => void} resolve
             * @param {(v: string) => void} reject
             */
            (resolve, reject) => {
                corLoadLocalFile(fpath, "string",
                    v => {
                        if (v instanceof ArrayBuffer) {
                            throw new Error("Unexpected return type");
                        }
                        else {
                            resolve(v);
                        }
                    },
                    err => {
                        reject(err);
                    }
                );
            }
        );
    }
    else {
        return fetch(fpath).then(res => res.text());
    }
}

/**
 * @param {string} fpath
 */
function loadBufferAsset(fpath) {
    if (_cordovaActive) {
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
    else {
        return fetch(fpath).then(res => res.arrayBuffer());
    }
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

initCordova().then((b) => {
    LOG(b ? "Running as Cordova app" : "Running as web site");
    // loadTextAsset("assets/test.txt").then((v) => LOG(v));
    // loadBufferAsset("assets/test.png").then((v) => LOG(`${v.byteLength} bytes`));
    // TEST fetch redirect
    fetch("assets/test.txt").then(res => res.text()).then(txt => console.log(txt));
    fetch("assets/test.png").then(res => res.arrayBuffer()).then(buf => LOG(`Buffer: ${buf.byteLength} bytes`));
    // fetch("https://www.nu.nl/").then(res => {
    //     console.log(`Remote, type =`);
    //     console.log(res.body);
    // });
});