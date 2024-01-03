import "./notepad.css"
import { KWARGS, Module } from "../webui/module"
import { Event, Eventbus } from "../webui/eventbus"
import { PageElement, Tool, Sprite, DocumentAPI, Document } from "./interfaces"
import { Toolbar } from './tools/toolbar/toolbar'


export class Notepad extends Module<HTMLDivElement> implements DocumentAPI {
    private tools = new Map<string, Tool>()
    private canvasContainer: Module<HTMLDivElement>
    private layers = new Map<string, string[]>()  // layerid -> element.uuids
    private textures = new Map<string, Sprite>()
    private pageElements = new Map<string, PageElement>()
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private activeTool: string = "pen"
    private isMainDown: boolean = false
    private isMoveDown: boolean = false
    private isTouchAllowed: boolean = false
    private offset = [0.0, 0.0]
    private scale = 1.0
    private lastPos = [0.0, 0.0]
    private lowestEntity = 0.0
    private openDocumentIdentifier: string = ""

    constructor() {
        super("div")
        this.add(new Toolbar(this.tools))
        
        this.canvasContainer = new Module<HTMLDivElement>("div", "", "notepad-canvasContainer")
        this.add(this.canvasContainer)
        this.canvas = document.createElement("canvas")
        this.canvasContainer.htmlElement.appendChild(this.canvas)
        this.context = this.canvas.getContext("2d", {
            alpha: true,
            desynchronized: true,
        })!
        
        window.onresize = this.resizeHandler.bind(this)

        Eventbus.register("toolbar/change", this.onToolbarChange.bind(this))

        this.canvas.addEventListener('touchstart', function(ev: TouchEvent) {ev.preventDefault();}, false);
        this.canvas.addEventListener('pointerdown', this.pointermove.bind(this), false);
        this.canvas.addEventListener('pointermove', this.pointermove.bind(this), false);
        this.canvas.addEventListener('pointerup',   this.pointermove.bind(this), false);
    }

    public update(kwargs: KWARGS, _changedPage: boolean) {
        if (kwargs.file) {
            this.loadLocalStorage(kwargs.file)
        } else if (localStorage["sp_last_file"]) {
            this.loadLocalStorage(localStorage["sp_last_file"])
        }
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    private loadLocalStorage(identifier: string) {
        if (!localStorage["sp_file_" + identifier]) {
            alert("Error file not locally available: " + identifier)
            return
        }
        this.openDocumentIdentifier = identifier
        this.deleteElements(this.getDocument().values(), false)
        this.addElements(JSON.parse(localStorage["sp_file_" + identifier]), false)
    }

    private saveLocalStorage() {
        if (this.openDocumentIdentifier == "") {
            let timestamp = new Date().toISOString().substring(0, 19).replace("T", "_").replaceAll(":","")
            this.openDocumentIdentifier = timestamp + "_Unnamed.spf"
        }
        let files: string[] = JSON.parse(localStorage["sp_files"] || "[]")
        if (!files.includes(this.openDocumentIdentifier)) {
            files.push(this.openDocumentIdentifier)
            localStorage["sp_files"] = JSON.stringify(files)
        }
        const pageElements = Array.from(this.getDocument().values())
        localStorage["sp_file_" + this.openDocumentIdentifier] = JSON.stringify(pageElements)
        localStorage["sp_last_file"] = this.openDocumentIdentifier
        console.log("Saved: " + this.openDocumentIdentifier)
    }

    private pointermove(ev: PointerEvent) {
        let rect = this.canvas.getBoundingClientRect()
        let x = ev.x - rect.left + this.offset[0]
        let y = ev.y - rect.top + this.offset[1]
        if (!this.isMoveDown && ev.pressure > 0 && ((ev.pointerType == "mouse" && (ev.button == 0 || this.isMainDown)) || ev.pointerType == "pen")) {
            if (!this.isMainDown) {
                this.tools.get(this.activeTool)?.onStart(this, this.context, x, y, this.offset[0], this.offset[1], this.scale)
                this.isMainDown = true
            } else {
                this.tools.get(this.activeTool)?.onMove(this, this.context, x, y, this.offset[0], this.offset[1], this.scale)
            }
        }
        if (!this.isMainDown && ev.pressure > 0 && ((ev.pointerType == "mouse" && (ev.button == 1 || this.isMoveDown)) || (ev.pointerType == "touch" && this.isTouchAllowed))) {
            if (!this.isMoveDown) {
                this.lastPos = [x, y]
                this.isMoveDown = true
            } else {
                this.offset[0] += this.lastPos[0] - x
                this.offset[1] += this.lastPos[1] - y
                this.offset[0] = Math.min(this.offset[0], 1000 - this.canvas.width)
                this.offset[0] = Math.max(this.offset[0], 0)
                this.offset[1] = Math.min(this.offset[1], this.lowestEntity - this.canvas.height * 0.1)
                this.offset[1] = Math.max(this.offset[1], 0)
                this.redraw()
            }
        }
        else if (ev.pressure <= 0 && (ev.pointerType == "mouse" || ev.pointerType == "pen" || (ev.pointerType == "touch" && this.isTouchAllowed))) {
            if (this.isMainDown) {
                this.tools.get(this.activeTool)?.onEnd(this, this.context, x, y, this.offset[0], this.offset[1], this.scale)
                this.isMainDown = false
            }
            if (this.isMoveDown) {
                // Do nothing
                this.isMoveDown = false
            }
        }
    }

    getDocument(): Document {
        return this.pageElements
    }

    addElements(elements: Iterable<PageElement>, autosave: boolean = true): void {
        this.modifyElements(elements, autosave)
    }

    modifyElements(elements: Iterable<PageElement>, autosave: boolean = true): void {
        for (let element of elements) {
            let toolName = element.type
            if (!this.tools.has(toolName)) {
                alert("Unsupported tool please let the dev know: " + toolName)
            }
            let tool = this.tools.get(toolName)!
            let sprite = tool.render(element)
            this.pageElements.set(element.uuid, element)
            this.textures.set(element.uuid, sprite)
            if (!this.layers.has(element.layer)) {
                this.layers.set(element.layer, [])
            }
            let list = this.layers.get(element.layer)!
            if (list.indexOf(element.uuid) == -1)
            {
                list.push(element.uuid)
            }
        }
        this.lowestEntity = 0
        for (let [_uuid, element] of this.pageElements) {
            this.lowestEntity = Math.max(element.bbox_xyxy[3], this.lowestEntity)
        }
        this.redraw()
        if (autosave) {
            this.saveLocalStorage()
        }
    }

    deleteElements(elements: Iterable<PageElement>, autosave: boolean = true): void {
        for (let element of elements) {
            this.pageElements.delete(element.uuid)
            this.textures.delete(element.uuid)
            let list = this.layers.get(element.layer)!
            let idx = list.indexOf(element.uuid)
            if (idx > -1)
            {
                list.splice(idx, 1)
            }
        }
        this.redraw()
        if (autosave) {
            this.saveLocalStorage()
        }
    }

    redraw() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
        let layers = Array.from( this.layers.keys())
        layers = layers.sort()
        for (let layer of layers) {
            let uuids = this.layers.get(layer)!
            for (let uuid of uuids) {
                let renderable = this.pageElements.get(uuid)!
                let sprite = this.textures.get(uuid)!
                let [x1,y1,x2,y2] = renderable.bbox_xyxy
                x1 -= this.offset[0]
                y1 -= this.offset[1]
                x2 -= this.offset[0]
                y2 -= this.offset[1]
                this.context.drawImage(sprite, x1, y1, x2-x1, y2-y1)
            }
        }
    }

    private onToolbarChange(_topic: string, event: Event) {
        if (event.type == "string" && event.data.indexOf("tool_") == 0) {
            let oldTool = this.activeTool
            this.activeTool = event.data.substring(5)
            if (oldTool != this.activeTool) {
                this.tools.get(oldTool)?.deactivate()
                this.tools.get(this.activeTool)?.activate()
                console.log("Switched tool to: " + this.activeTool)
            }
        } else if (event.type == "string" && event.data == "touchToggle") {
            this.isTouchAllowed = !this.isTouchAllowed
        }
    }

    protected resizeHandler() {
        this.canvas.width = this.canvasContainer.htmlElement.clientWidth
        this.canvas.height = this.canvasContainer.htmlElement.clientHeight
        this.redraw()
        console.log("resized")
    }
}
