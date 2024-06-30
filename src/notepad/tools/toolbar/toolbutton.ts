import { Event, Eventbus } from "../../../webui/eventbus"
import { Button } from "../../../webui/form"
import { Module } from "../../../webui/module"

export class ToolButton extends Module<HTMLDivElement> {
    private static selectableTools: string[] = []
    protected popup: ToolPopup | MenuPopup | null = null
    
    public constructor(
        protected id: string,
        protected selectable: boolean,
        innerHTML: string = "",
        right: boolean = false,
        protected togglable: boolean = false)
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

    public onClick(): boolean {
        if (this.togglable) {
            if (!this.hasClass("selected-tool")){
                this.setClass("selected-tool")
                this.setClass("selected-tool-good")
            } else {
                this.unsetClass("selected-tool")
                this.unsetClass("selected-tool-good")
            }
        }
        if (this.popup) {
            if (!this.selectable || this.hasClass("selected-tool")) {
                this.popup.show()
            }
        }
        Eventbus.send("toolbar/change", {
            "type": "string", "data": this.id, "allowNetwork": false
        })
        return true
    }

    protected onSelectionChanged(topic: string, event: Event): void {
        if (topic == "toolbar/change" && event.type == "string"){
            if (ToolButton.selectableTools.indexOf(event.data) == -1) return
            if (!this.togglable) {
                if (event.data == this.id) {
                    this.setClass("selected-tool")
                } else {
                    this.unsetClass("selected-tool")
                }
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

    public addPopup(popup: ToolPopup | MenuPopup) {
        if (this.popup != null) {
            alert("CODING ERROR! Tool already has a popup attached!")
        }
        this.add(popup)
        this.popup = popup
        this.popup.setParent(this.id)
    }
}

export class ToolMenuButton extends ToolButton {
    protected parentMenu: MenuPopup | null = null

    constructor(
        protected id: string,
        iconSvg: string = "",
        text: string = "",
    ) {
        super(id, false, iconSvg + "&ensp;" +  text)
        this.unsetClass("tool")
        this.setClass("toolWithText")
    }

    public setParentMenu(menu: MenuPopup) {
        this.parentMenu = menu
    }
    
    public onClick(): boolean {
        window.setTimeout(() => this.parentMenu?.hide(), 10)
        return super.onClick()
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
            child.setParentTool(parentId, this)
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

export class MenuPopup extends Module<HTMLDivElement> {
    private grayOut: HTMLDivElement

    public constructor(children: ToolMenuButton[] = []) {
        super("div", "", "menuPopup")
        children.forEach(child => {
            child.setParentMenu(this)
            this.add(child)
        });
        this.grayOut = document.createElement("div")
        this.grayOut.classList.add("toolPopupGrayout")
        this.grayOut.onclick = this.hide.bind(this)
        document.getElementById("global")!.appendChild(this.grayOut)
        this.hide()
    }
    
    public setParent(_parentId: string) {}

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
    protected parentPopup: ToolPopup | null = null

    public constructor(innerHTML: string) {
        super(innerHTML, "tool")
    }
    
    public setParentTool(parentId: string, parentPopup: ToolPopup) {
        this.parentId = parentId
        this.parentPopup = parentPopup
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
        window.setTimeout(() => this.parentPopup?.hide(), 10)
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
        window.setTimeout(() => this.parentPopup?.hide(), 10)
        Eventbus.send("toolbar/setting", {
            "type": "setting", "data": {"id": this.parentId, "size": this.size}, "allowNetwork": false
        })
    }
}
