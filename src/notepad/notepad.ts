import { Event, Eventbus } from "../eventbus"
import { RenderableData, Renderable, Sprite } from "./interfaces"
import { Stroke } from "./renderables/stroke"
import "./notepad.css"


export class Notepad {
    private static renderers = new Map<string, Renderable>()
    static {
        Notepad.register("Stroke", new Stroke())
    }
    
    private layers = new Map<string, string[]>()  // layerid -> element.uuids
    private textures = new Map<string, Sprite>()
    private renderables = new Map<string, RenderableData>()
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private activeTool: string = "Stroke"
    private offset = [0.0, 0.0]

    constructor(
            private mainDiv: HTMLDivElement) {
        this.mainDiv.innerHTML = `<canvas id="canvas" />`
        this.canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
        this.context = this.canvas.getContext("2d")!
        
        window.onresize = this.resizeHandler.bind(this)
        this.resizeHandler()
        window.setTimeout(this.resizeHandler.bind(this), 100)

        Eventbus.register("toolbar/change", this.onToolbarChange.bind(this))
        Eventbus.register("render/updateElement", this.onUpdateRenderElement.bind(this))
        Eventbus.register("render/deleteElement", this.onDeleteRenderElement.bind(this))
        Eventbus.register("render/redraw", this.redraw.bind(this))

        this.canvas.addEventListener('touchstart', function(ev: TouchEvent) {ev.preventDefault();}, false);
        this.canvas.addEventListener('pointerdown', this.pointerdown.bind(this), false);
        this.canvas.addEventListener('pointermove', this.pointermove.bind(this), false);
        this.canvas.addEventListener('pointerup',   this.pointerup.bind(this), false);
    }

    private pointerdown(ev: PointerEvent) {
        if (ev.pointerType == "mouse" || ev.pointerType == "pen") {
            let rect = this.canvas.getBoundingClientRect()
            let x = ev.x + this.offset[0] - rect.left
            let y = ev.y + this.offset[1] - rect.top
            Notepad.renderers.get(this.activeTool)?.onStart(this.context, x, y)
        }
    }
    private pointermove(ev: PointerEvent) {
        if (ev.pressure > 0.0 && (ev.pointerType == "mouse" || ev.pointerType == "pen")) {
            let rect = this.canvas.getBoundingClientRect()
            let x = ev.x + this.offset[0] - rect.left
            let y = ev.y + this.offset[1] - rect.top
            Notepad.renderers.get(this.activeTool)?.onMove(this.context, x, y)
        }
    }
    private pointerup(ev: PointerEvent) {
        if (ev.pointerType == "mouse" || ev.pointerType == "pen") {
            let rect = this.canvas.getBoundingClientRect()
            let x = ev.x + this.offset[0] - rect.left
            let y = ev.y + this.offset[1] - rect.top
            Notepad.renderers.get(this.activeTool)?.onEnd(this.context, x, y)
        }
    }

    public static register(elementType: string, renderer: Renderable) {
        this.renderers.set(elementType, renderer)
    }

    private onUpdateRenderElement(topic: string, event: Event) {
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

    private onDeleteRenderElement(topic: string, event: Event) {
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

    private redraw(topic: string = "", event: Event | null = null) {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
        for (let [layer, uuids] of this.layers) {
            for (let uuid of uuids) {
                let renderable = this.renderables.get(uuid)!
                let sprite = this.textures.get(uuid)!
                let [x1,y1,x2,y2] = renderable.bbox_xyxy
                this.context.drawImage(sprite, x1, y1)
            }
        }
    }

    private onToolbarChange(topic: string, event: Event) {
        if (event.type == "string" && event.data == "togglePreview") {
            if (this.mainDiv.classList.contains("full-width")) {
                this.mainDiv.classList.remove("full-width")
            } else {
                this.mainDiv.classList.add("full-width")
            }
            this.resizeHandler()
            window.setTimeout(this.resizeHandler.bind(this), 100)
        }
    }

    private resizeHandler() {
        this.canvas.width = this.mainDiv.clientWidth
        this.canvas.height = this.mainDiv.clientHeight
        this.redraw()
    }
}
