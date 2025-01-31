//@ts-check

import { showDebug } from "./util.js";

/** Access functions, filled in for Cordova */
var _cordovaActive = false;

/** @type (msg: string) => void */
var callback;

export function getDataDirectory() {
    if (_cordovaActive) {
        // CHECKED: path seems correct and is a directory! Reading entries does not seem to work though.
        // return cordova.file.externalRootDirectory + "Download";
        // return cordova.file.applicationStorageDirectory;
        return cordova.file.externalDataDirectory;
    }
    else {
        throw new Error("Cordova is not active")
    }
}

export function getInfo() {
    try {
        return cordova || {};
    }
    catch (e) {
        return {};
    }
}

async function onDeviceReady() {
    // Cordova is now initialized.
    _cordovaActive = true;

    showDebug("Cordova device ready");

    const status = 'Running cordova-' + cordova.platformId + '@' + cordova.version;

    showDebug(status);

    showDebug("File plugin?");
    try {
        showDebug("present");
        showDebug(JSON.stringify(cordova.file, undefined, 2));
    }
    catch (e) {
        showDebug("NOT present");
    }

    callback(status);

    // listDirectory();
}

/**
 *
 * @param {string} url
 */
export function openSite(url) {
    const fileUrl = getDataDirectory();
    window.open(`${fileUrl}${url}`);
}

export async function deleteFile(url) {
    console.log(`Delete file ${url}`);

    return new Promise(
        /**
         *
         * @param {(v: any) => void} resolve
         * @param {(err: string) => void} reject
         */
        (resolve, reject) => {
            window.resolveLocalFileSystemURL(url,
                entry => {
                    if (entry.isDirectory) {
                        /** @type DirectoryEntry */(entry).removeRecursively(
                        () => resolve(undefined),
                        err => reject(`Error deleting file ${url}, error = ${err}`));
                    }
                    else {
                        entry.remove(
                            () => resolve(undefined),
                            err => reject(`Error deleting file ${url}, error = ${err}`)
                        );
                    }
                },
                err => reject(`Error deleting file ${url}, error = ${err}`)
            );
        }
    )
}

/**
 *
 * @param {string} fileUrl
 */
function listDirectory(fileUrl) {
    showDebug(`Dir listing for ${fileUrl}`);
    window.resolveLocalFileSystemURL(fileUrl,
        (entry) => {
            showDebug(`Checking dir`);
            showDebug(JSON.stringify(entry));
            entryCallback(entry);
        },
        errorCallback);

    /**
     *
     * @param {Entry} entry
     */
    function entryCallback(entry, indent = 0) {
        if (entry.isDirectory) {
            // showDebug(`${entry.name} is a directory, reading entries`);
            const dirReader = /** @type DirectoryEntry */(entry).createReader();
            dirReader.readEntries(
                (entries) => {
                    for (let i = 0; i < entries.length; i++) {
                        showDebug(`${entries[i].fullPath} ${entries[i].isDirectory ? "dir" : ""}`);
                        if (entries[i].isDirectory) {
                            entryCallback(entries[i], indent + 2);
                        }
                    }
                },
                (error) => {
                    showDebug("readEntries error: " + error.code);
                }
            );
        }
        else {
            showDebug(`${entry.name} is not a directory`);
        }
    }
    /**
     *
     * @param {FileError} err
     */
    function errorCallback(err) {
        showDebug("ERROR");
        showDebug(err.code);
    }
}

/**
 * @param {string} siteName
 * @param {ArrayBuffer} buffer
 * @param {() => void} cb
 */
export function saveAndUnpackSite(siteName, buffer, cb) {
    if (_cordovaActive) {
        // Write file
        const fileUrl = getDataDirectory();
        window.resolveLocalFileSystemURL(fileUrl,
            (entry) => {
                /** @type DirectoryEntry */(entry).getFile(`${siteName}.zip`, { create: true }, file => {
                showDebug("got the file " + file.fullPath);
                file.createWriter(fileWriter => {
                    fileWriter.onwriteend = () => {
                        showDebug("Written OK");
                        // Starting unzip
                        const src = `${fileUrl}${siteName}.zip`;
                        const dst = `${fileUrl}${siteName}`;
                        showDebug(`Unzip: ${src} => ${dst}`);
                        // @ts-ignore
                        zip.unzip(src, dst, (err) => {
                            console.log("ZIP DONE: " + err);
                            if (!err) {
                                deleteFile(src).then(cb, e => console.error(e));
                            }
                        });
                    }
                    fileWriter.onerror = () => {
                        showDebug("file writer failed");
                    }
                    fileWriter.write(buffer);
                    showDebug(`written buffer, ${buffer.byteLength} bytes`);
                }, () => showDebug("Write failed"));
            });
            }
            ,
            (err) => console.log(`Error ${err} writing zip ${fileUrl}`));
    }
    else {
        showDebug("Cordova not active, cannot write buffer");
    }
}

/**
 *
 * @param {(string) => void} cb
                        */
export function initCordova(cb) {
    showDebug("Initializing Cordova");
    callback = cb;
    // Wait for the deviceready event before using any of Cordova's device APIs.
    // See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
    document.addEventListener('deviceready', onDeviceReady, false);
    showDebug("Done");
}
