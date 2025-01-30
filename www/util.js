// @ts-check

const elementName = "divDebugInfo";

/** @type HTMLElement */
var divDebugInfo;

export function showDebug(s) {
    if (!divDebugInfo) {
        divDebugInfo = /** @type HTMLElement */(document.getElementById(elementName));
    }
    divDebugInfo.insertAdjacentHTML("beforeend", `${s}\n`);
}
