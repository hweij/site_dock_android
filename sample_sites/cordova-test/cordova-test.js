// @ts-check

import { initCordova } from "./cordova-android.js";

// *****
// ADD THIS TO ENABLE CORDOVA SUPPORT:
// Check for Cordova support before doing any fetches or other related stuff
const b = await initCordova();
// Start the code after Cordova has been initialized ( or failed to initialize)
// *****

LOG(b ? "Running as Cordova app" : "Running as web site");
// TEST fetch redirect
fetch("assets/test.txt").then(res => res.text()).then(txt => console.log(txt));
fetch("assets/test.png").then(res => res.arrayBuffer()).then(buf => LOG(`Buffer: ${buf.byteLength} bytes`));
// fetch("https://www.nu.nl/").then(res => {
//     console.log(`Remote, type =`);
//     console.log(res.body);
// });

function LOG(s) {
    const win = document.getElementById("divLogs");
    if (win) {
        win.insertAdjacentText("beforeend", `${s}\n`);
    }
    console.log(s);
}
