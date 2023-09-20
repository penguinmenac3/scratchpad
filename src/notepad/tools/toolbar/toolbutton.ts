import { Event, Eventbus } from "../../../webui/eventbus"
import { Button } from "../../../webui/form"
import { Module } from "../../../webui/module"

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
        Eventbus.register("toolbar/setting", this.onSettingChanged.bind(this))
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

    protected onSettingChanged(topic: string, event: Event): void {
        if (topic == "toolbar/setting" && event.type == "setting"){
            if (event.data.id == this.id) {
                if (event.data.color) {
                    this.htmlElement.style.fill = "var(--color-" + event.data.color + "-font)"
                }
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
        this.popup.setParent(this.id)
    }
}


export class ToolPopup extends Module<HTMLDivElement> {
    private grayOut: HTMLDivElement

    public constructor(private children: ToolSetting[] = []) {
        super("div", "", "toolPopup")
        children.forEach(child => {
            this.add(child)
        });
        this.grayOut = document.createElement("div")
        this.grayOut.classList.add("toolPopupGrayout")
        this.grayOut.onclick = this.hide.bind(this)
        document.getElementById("global")!.appendChild(this.grayOut)
        this.hide()
    }

    public setParent(parentId: string) {
        this.children.forEach(child => {
            child.setParentTool(parentId)
        });
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

export class ToolSetting extends Button {
    protected parentId: string = ""
    public constructor(innerHTML: string) {
        super(innerHTML, "tool")
    }
    
    public setParentTool(parentId: string) {
        this.parentId = parentId
    }
}

export class ToolColorSetting extends ToolSetting {
    public constructor(innerHTML: string, private color: string, isDefault: boolean = false) {
        super(innerHTML)
        this.htmlElement.style.fill = "var(--color-" + color + "-font)"
        if (isDefault) {
            window.setTimeout(this.onClick.bind(this), 100)
        }
    }

    public onClick(): void {
        Eventbus.send("toolbar/setting", {
            "type": "setting", "data": {"id": this.parentId, "color": this.color}, "allowNetwork": false
        })
    }
}

export class ToolSizeSetting extends ToolSetting {
    public constructor(innerHTML: string, private size: number, isDefault: boolean = false) {
        super(innerHTML)
        if (isDefault) {
            window.setTimeout(this.onClick.bind(this), 100)
        }
    }

    public onClick(): void {
        Eventbus.send("toolbar/setting", {
            "type": "setting", "data": {"id": this.parentId, "size": this.size}, "allowNetwork": false
        })
    }
}
