//@ts-check

/**
 * @returns
 */
function html(strings, ...values) {
    return String.raw({ raw: strings }, ...values);
}

function attachTemplate(el, template) {
    const root = el.attachShadow({ mode: "open" });
    root.appendChild(template.content.cloneNode(true));
}

/**
 * @param {string} s
 */
function createTemplate(s) {
    const template = document.createElement("template");
    template.innerHTML = s;
    return template;
}

// ***** COMPONENTS *****

class BaseElement extends HTMLElement {
    /** tag name, must set for each element */
    static tagName = "base";

    /**
     * Create element
     */
    static create(parent) {
        // /** @type T BaseElement*/
        const res = document.createElement(this.tagName);
        if (parent) {
            parent.appendChild(res);
        }
        return res;
    }

    /**
     * Get element in shadow dom
     *
     * @param {string} id
     */
    EL(id) {
        return /** @type HTMLElement */(this.shadowRoot?.getElementById(id));
    }
}

/**
 * Web component site-entry
 */
export class SiteEntry extends BaseElement {
    static tagName = "site-entry";

    /** @type ((action: "launch" | "delete") => void) | undefined */
    onAction;

    static template = createTemplate(
        html`
        <style>
            :host {
                display: grid;
                grid-template-columns: auto max-content;
                align-items: center;
                cursor: pointer;
                user-select: none;
                font-size: 18px;
                margin: 4px 0px;
                background-color: #aaccff;
            }
            #content {
                padding: 0px 8px;
            }
            #delete-entry {
                background-color: #9dbded;
                color: #aa0000;
                padding: 4px 10px;
                margin: 4px 8px;
            }
        </style>
        <div id="content">Content</div>
        <div id="delete-entry">x</div>
    `);

    _content = "";
    set content(s) {
        this._content = s;
        this.EL("content").innerText = this._content;
    }
    get content() {
        return this._content;
    }

    connectedCallback() {
        attachTemplate(this, SiteEntry.template);
        this.EL("delete-entry").onclick = (e) => {
            e.stopPropagation();
            if (this.onAction) {
                this.onAction("delete");
            }
        }
        this.onclick = (e) => {
            if (this.onAction) {
                this.onAction("launch");
            }
        }
    }
}
customElements.define(SiteEntry.tagName, SiteEntry);
console.log("Registered");