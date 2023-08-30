import { Event, Eventbus } from "../../webui/eventbus"
import { Module } from "../../webui/module"

export class ToolButton extends Module<HTMLDivElement> {
    private static selectableTools: string[] = []
    protected popup: ToolPopup | null = null
    
    public constructor(protected id: string, selectable: boolean, innerHTML: string = "", right: boolean = false)
    {
        super("div", innerHTML, "tool")
        if (right) {
            this.htmlElement.style.float = "right"
        }
        if (selectable) {
            ToolButton.selectableTools.push(this.id)
        }
        this.htmlElement.onclick = (_ev: MouseEvent) => {
            this.onClick()
        }
        Eventbus.register("toolbar/change", this.onSelectionChanged.bind(this))
    }

    public onClick() {
        if (!this.hasClass("selected-tool")){
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
                this.setClass("selected-tool")
            } else {
                this.unsetClass("selected-tool")
            }
        }
        return
    }

    public addPopup(popup: ToolPopup) {
        if (this.popup != null) {
            alert("CODING ERROR! Tool already has a popup attached!")
        }
        this.add(popup)
        this.popup = popup
    }
}


export class ToolPopup extends Module<HTMLDivElement> {
    private grayOut: HTMLDivElement

    public constructor() {
        super("div", "", "toolPopup")
        this.grayOut = document.createElement("div")
        this.grayOut.classList.add("toolPopupGrayout")
        this.grayOut.onclick = this.hide.bind(this)
        document.getElementById("global")!.appendChild(this.grayOut)
        this.hide()
    }

    public show() {
        super.show()
        this.grayOut.style.display = "block"
    }

    public hide() {
        super.hide()
        this.grayOut.style.display = "none"
    }
}
