import { Event, Eventbus } from "../../eventbus"

export class ToolButton {
    private static selectableTools: string[] = []
    protected element: HTMLDivElement
    
    public constructor(protected toolbar: HTMLDivElement,  protected id: string, selectable: boolean, innerHTML: string = "", right: boolean = false)
    {
        this.element = document.createElement("div")
        toolbar.appendChild(this.element)
        this.element.classList.add("tool")
        if (right) {
            this.element.style.float = "right"
        }
        if (selectable) {
            ToolButton.selectableTools.push(this.id)
        }
        if (innerHTML == "") {
            innerHTML = `id_${id}`
        }
        this.setContent(innerHTML)
        this.element.onclick = this.onClick.bind(this)
        Eventbus.register("toolbar/change", this.onSelectionChanged.bind(this))
    }

    public onClick(_: MouseEvent | null = null) {
        Eventbus.send("toolbar/change", {
            "type": "string", "data": this.id, "allowNetwork": false
        })
        return true
    }

    protected onSelectionChanged(topic: string, event: Event): void {
        if (topic == "toolbar/change" && event.type == "string"){
            if (ToolButton.selectableTools.indexOf(event.data) == -1) return
            if (event.data == this.id) {
                if (!this.element.classList.contains("selected-tool")){
                    this.element.classList.add("selected-tool")
                }
            } else {
                if (this.element.classList.contains("selected-tool")){
                    this.element.classList.remove("selected-tool")
                }
            }
        }
        return
    }

    protected setContent(html: string) {
        this.element.innerHTML = html
    }
}
