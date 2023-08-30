import { Event, Eventbus } from "../../eventbus"

export class ToolButton {
    private static selectableTools: string[] = []
    protected element: HTMLDivElement
    protected popup: ToolPopup | null = null
    
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
        if (!this.element.classList.contains("selected-tool")){
            Eventbus.send("toolbar/change", {
                "type": "string", "data": this.id, "allowNetwork": false
            })
        } else {
            this.popup?.show()
        }
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

    public addPopup(popup: ToolPopup) {
        if (this.popup != null) {
            alert("CODING ERROR! Tool already has a popup attached!")
        }
        this.element.appendChild(popup.element)
        this.popup = popup
    }

    protected setContent(html: string) {
        this.element.innerHTML = html
    }
}


export class ToolPopup {
    public element: HTMLDivElement
    private grayOut: HTMLDivElement
    private displayCache: string = ""

    public constructor() {
        this.element = document.createElement("div")
        this.element.classList.add("toolPopup")
        this.grayOut = document.createElement("div")
        this.grayOut.classList.add("toolPopupGrayout")
        this.grayOut.onclick = () => {
            this.hide()
        }
        document.getElementById("global")!.appendChild(this.grayOut)
        this.hide()
    }

    public show() {
        this.element.style.display = this.displayCache
        this.grayOut.style.display = "block"
    }

    public hide() {
        this.displayCache = this.element.style.display
        this.element.style.display = "none"
        this.grayOut.style.display = "none"
    }
}
