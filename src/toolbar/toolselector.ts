import { Eventbus } from "../eventbus"

export class ToolSelector {
    protected element: HTMLDivElement
    
    public constructor(protected toolbar: HTMLDivElement,  protected id: string, innerHTML: string = "")
    {
        this.element = document.createElement("div")
        toolbar.appendChild(this.element)
        this.element.classList.add("tool")
        if (innerHTML == "") {
            innerHTML = `id_${id}`
        }
        this.setContent(innerHTML)
        this.element.onclick = this.onClick.bind(this)
    }

    protected onClick(event: MouseEvent) {
        Eventbus.send("toolbar/change", {
            "type": "string", "data": this.id, "allowNetwork": false
        })
        return true
    }

    protected setContent(html: string) {
        this.element.innerHTML = html
    }
}
