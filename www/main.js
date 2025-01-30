// @ts-check

import * as CORD from "./cordova_init.js";
import { showDebug } from "./util.js";

const bLoadRemote = /** @type HTMLButtonElement */(document.getElementById("bLoadRemote"));
const inputStartURL = /** @type HTMLInputElement */(document.getElementById("inputStartURL"));

// Get settings
var startURL = localStorage.getItem("startURL");
inputStartURL.onblur = () => {
    startURL = inputStartURL.value;
    localStorage.setItem("startURL", startURL);
    console.log(`Set new start URL: ${startURL}`);
    updateUI();
}

function updateUI() {
    bLoadRemote.disabled = !Boolean(startURL);
    inputStartURL.value = startURL || "";
}

CORD.initCordova((status) => {
    showDebug("Callback in main");
    showDebug(status);
    updateSitesList();
});

showDebug("JavaScript OK");

showDebug("GET INFO");
showDebug(JSON.stringify(CORD.getInfo(), undefined, 2));

const bPickFile = /** @type HTMLButtonElement */(document.getElementById("bPickFile"));
bPickFile.onclick = async () => {
    const [handle] = await window.showOpenFilePicker(
        {
            // No selectable files on Andrid when filters used..
            // types: [
            //     {
            //         description: "Sites",
            //         accept: {
            //             "application/json": [".json"],
            //             "application/zip": [".zip"]
            //         }
            //     }
            // ],
            startIn: "downloads",
            // excludeAcceptAllOption: true,
            multiple: false
        }
    );
    if (handle) {
        if (handle.name.endsWith(".zip")) {
            const baseName = handle.name.replace(".zip", "");
            console.log(`File = ${handle}, base name = ${baseName}`);
            const data = await handle.getFile();
            console.log(`File size: ${data.size}`);
            const buffer = await data.arrayBuffer();
            CORD.saveAndUnpackSite(baseName, buffer, updateSitesList);
        }
        else {
            console.log(`${handle.name} is not a zip file`);
        }
    }
}

function updateSitesList() {
    getLocalSites(CORD.getDataDirectory(), (sites) => {
        const divSites = /** @type HTMLElement */(document.getElementById("divSites"));
        divSites.innerHTML = "";
        for (const site of sites) {
            const el = document.createElement("div");
            el.className = "site-entry";
            el.innerText = site.info?.name || site.name;
            divSites.appendChild(el);
            el.onclick = () => CORD.openSite(`${site.name}/index.html`);
        }
    })
}

/**
 * Retrieves a list of local sites/apps
 *
 * @param {string} dir
 * @param {(sites: any[]) => void} cb
 */
function getLocalSites(dir, cb) {
    const res = [];
    console.log("GET LOCAL SITES in " + dir);
    window.resolveLocalFileSystemURL(dir,
        (dirEntry) => {
            const dirReader = /** @type DirectoryEntry */(dirEntry).createReader();
            dirReader.readEntries(
                (entries) => {
                    let i = 0;
                    const nextEntry = () => {
                        if (i < entries.length) {
                            console.log(`Processing item ${i} of { entries.length }`);
                            const siteEntry = entries[i];
                            i++;
                            showDebug(`${siteEntry.fullPath} ${siteEntry.isDirectory ? "dir" : ""}`);
                            if (siteEntry.isDirectory) {
                                const data = { name: siteEntry.name };
                                res.push(data);
                                // It's a directory. Check if there is a app_info.json file inside
                                /** @type DirectoryEntry */(siteEntry).getFile(
                                    `app_info / index.json`,
                                    undefined,
                                    fileEntry => {
                                        showDebug(`Try to read info: ${fileEntry.fullPath}`);
                                        fileEntry.file((file) => {
                                            let done = false;
                                            var reader = new FileReader();

                                            reader.onloadend = function (e) {
                                                console.log("Found info");
                                                console.log(this.result);
                                                data.info = JSON.parse(this.result?.toString() || "{}");
                                                if (!done) { done = true; nextEntry(); }
                                            }

                                            reader.onerror = function (e) {
                                                console.log(`Error for`);
                                                console.log(this.result);
                                                if (!done) { done = true; nextEntry(); }
                                            }

                                            reader.readAsText(file);
                                        });
                                    },
                                    error => {
                                        console.warn(`no app info found(${error})`);
                                        nextEntry();
                                    }
                                );
                            }
                            else {
                                nextEntry();
                            }
                        }
                        else {
                            // Done
                            cb(res);
                        }
                    }
                    // Start scan
                    nextEntry();
                },
                (error) => {
                    showDebug("readEntries error: " + error.code);
                }
            );
        },
        () => showDebug(`Error reading sites directory ${dir} `));
}

bLoadRemote.onclick = () => {
    if (startURL) {
        window.open(startURL);
    }
}

updateUI();