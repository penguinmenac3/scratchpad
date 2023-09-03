import "./notepad.css"
import { KWARGS, Module } from "../webui/module"
import { Event, Eventbus } from "../webui/eventbus"
import { RenderableData, Renderable, Sprite } from "./interfaces"
import { Pen } from "./renderables/pen"
import { Text } from "./renderables/text"
import { Toolbar } from './toolbar/toolbar'
import { PagePreview } from './page_preview/page_preview'


export class Notepad extends Module<HTMLDivElement> {
    private static renderers = new Map<string, Renderable>()
    static {
        Notepad.register("pen", new Pen("base", 1, "FF"))
        Notepad.register("text", new Text("base", 12))
        Notepad.register("marker", new Pen("accent", 20, "77"))
    }

    private canvasContainer: Module<HTMLDivElement>
    private layers = new Map<string, string[]>()  // layerid -> element.uuids
    private textures = new Map<string, Sprite>()
    private renderables = new Map<string, RenderableData>()
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private activeTool: string = "pen"
    private isDown: boolean = false
    private offset = [0.0, 0.0]

    constructor() {
        super("div")
        this.add(new PagePreview())
        this.add(new Toolbar())
        this.canvasContainer = new Module<HTMLDivElement>("div", "", "notepad-canvasContainer")
        this.add(this.canvasContainer)
        this.canvas = document.createElement("canvas")
        this.canvasContainer.htmlElement.appendChild(this.canvas)
        this.context = this.canvas.getContext("2d")!
        
        window.onresize = this.resizeHandler.bind(this)

        Eventbus.register("toolbar/change", this.onToolbarChange.bind(this))
        Eventbus.register("render/updateElement", this.onUpdateRenderElement.bind(this))
        Eventbus.register("render/deleteElement", this.onDeleteRenderElement.bind(this))
        Eventbus.register("render/redraw", this.redraw.bind(this))

        this.canvas.addEventListener('touchstart', function(ev: TouchEvent) {ev.preventDefault();}, false);
        this.canvas.addEventListener('pointerdown', this.pointermove.bind(this), false);
        this.canvas.addEventListener('pointermove', this.pointermove.bind(this), false);
        this.canvas.addEventListener('pointerup',   this.pointermove.bind(this), false);
    }

    public update(_kwargs: KWARGS, _changedPage: boolean) {
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    private pointermove(ev: PointerEvent) {
        let rect = this.canvas.getBoundingClientRect()
        let x = ev.x + this.offset[0] - rect.left
        let y = ev.y + this.offset[1] - rect.top
        if (ev.pressure > 0 && (ev.pointerType == "mouse" || ev.pointerType == "pen")) {
            if (!this.isDown) {
                Notepad.renderers.get(this.activeTool)?.onStart(this.context, x, y)
                this.isDown = true
            } else {
                Notepad.renderers.get(this.activeTool)?.onMove(this.context, x, y)
            }
        }
        if(ev.pressure <= 0 && (ev.pointerType == "mouse" || ev.pointerType == "pen")) {
            if (this.isDown) {
                Notepad.renderers.get(this.activeTool)?.onEnd(this.context, x, y)
                this.isDown = false
            }
        }
    }

    public static register(elementType: string, renderer: Renderable) {
        renderer.setId(elementType)
        this.renderers.set(elementType, renderer)
    }

    private onUpdateRenderElement(_topic: string, event: Event) {
        if (event.type == "RenderElement") {
            let renderElement: RenderableData = event.data
            let rendererName = renderElement.type
            if (!Notepad.renderers.has(rendererName)) {
                alert("Unsupported renderer please let the dev know: " + rendererName)
            }
            let renderer = Notepad.renderers.get(rendererName)!
            let sprite = renderer.render(renderElement)
            this.renderables.set(renderElement.uuid, renderElement)
            this.textures.set(renderElement.uuid, sprite)
            if (!this.layers.has(renderElement.layer)) {
                this.layers.set(renderElement.layer, [])
            }
            let list = this.layers.get(renderElement.layer)!
            if (list.indexOf(renderElement.uuid) == -1)
            {
                list.push(renderElement.uuid)
            }
            Eventbus.send("render/redraw", {type: "Redraw", data: null, allowNetwork: false})
        }
    }

    private onDeleteRenderElement(_topic: string, event: Event) {
        if (event.type == "RenderElement") {
            let renderElement: RenderableData = event.data
            let rendererName = renderElement.type
            if (!Notepad.renderers.has(rendererName)) {
                alert("Unsupported renderer please let the dev know: " + rendererName)
            }
            this.renderables.delete(renderElement.uuid)
            this.textures.delete(renderElement.uuid)
            let list = this.layers.get(renderElement.layer)!
            let idx = list.indexOf(renderElement.uuid)
            if (idx > -1)
            {
                list.splice(idx, 1)
            }
            Eventbus.send("render/redraw", {type: "Redraw", data: null, allowNetwork: false})
        }
    }

    private redraw(_topic: string = "", _event: Event | null = null) {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
        for (let [_layer, uuids] of this.layers) {
            for (let uuid of uuids) {
                let renderable = this.renderables.get(uuid)!
                let sprite = this.textures.get(uuid)!
                let [x1,y1,x2,y2] = renderable.bbox_xyxy
                this.context.drawImage(sprite, x1, y1, x2-x1, y2-y1)
            }
        }
    }

    private onToolbarChange(_topic: string, event: Event) {
        if (event.type == "string" && event.data == "togglePreview") {
            if (this.canvasContainer.hasClass("notepad-canvasContainer-maximized")) {
                this.canvasContainer.unsetClass("notepad-canvasContainer-maximized")
            } else {
                this.canvasContainer.setClass("notepad-canvasContainer-maximized")
            }
            this.resizeHandler()
            window.setTimeout(this.resizeHandler.bind(this), 100)
        } else if (event.type == "string" && event.data.indexOf("tool_") == 0) {
            let oldTool = this.activeTool
            this.activeTool = event.data.substring(5)
            if (oldTool != this.activeTool) {
                Notepad.renderers.get(oldTool)?.deactivate()
                Notepad.renderers.get(this.activeTool)?.activate()
                console.log("Switched tool to: " + this.activeTool)
            }
        }
    }

    protected resizeHandler() {
        this.canvas.width = this.canvasContainer.htmlElement.clientWidth
        this.canvas.height = this.canvasContainer.htmlElement.clientHeight
        this.redraw()
        console.log("resized")
    }
}
