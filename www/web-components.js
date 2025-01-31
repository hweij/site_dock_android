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

/**
 * Web component site-entry
 */
export class SiteEntry extends HTMLElement {
    static template = createTemplate(
        html`
        <style>
            :host {
                display: grid;
                grid-template-columns: auto max-content;
                cursor: pointer;
                user-select: none;
                font-size: 18px;
                padding: 4px 8px;
                margin: 4px 0px;
                background-color: #aaccff;
            }
        </style>
        <div>Content</div>
        <div class="delete-entry">x</div>
    `);
    connectedCallback() {
        attachTemplate(this, SiteEntry.template);
    }
}
customElements.define("site-entry", SiteEntry);
