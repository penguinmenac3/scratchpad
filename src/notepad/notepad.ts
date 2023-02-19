import { Event, Eventbus } from "../eventbus"
import { RenderableData, Renderable } from "./interfaces"
import { Stroke } from "./renderables/stroke"
import "./notepad.css"


export class Notepad {
    private static renderers = new Map<string, Renderable>()
    static {
        Notepad.register("Stroke", new Stroke())
    }
    
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private liveCanvas: OffscreenCanvas
    private liveContext: CanvasRenderingContext2D
    private activeTool: string = "Stroke"
    private offset = [0.0, 0.0]

    constructor(
            private mainDiv: HTMLDivElement) {
        this.mainDiv.innerHTML = `<canvas id="canvas" />`
        this.canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
        this.liveCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height)
        this.context = this.canvas.getContext("2d")!
        this.liveContext = this.canvas.getContext("2d")!

        window.onresize = this.resizeHandler.bind(this)
        this.resizeHandler()
        window.setTimeout(this.resizeHandler.bind(this), 100)

        Eventbus.register("toolbar/change", this.onToolbarChange.bind(this))
        Eventbus.register("render/updateElement", this.onUpdateRenderElement.bind(this))
        Eventbus.register("render/deleteElement", this.onDeleteRenderElement.bind(this))

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
            Notepad.renderers.get(this.activeTool)?.onStart(this.liveContext, x, y)
        }
    }
    private pointermove(ev: PointerEvent) {
        if (ev.pressure > 0.0 && (ev.pointerType == "mouse" || ev.pointerType == "pen")) {
            let rect = this.canvas.getBoundingClientRect()
            let x = ev.x + this.offset[0] - rect.left
            let y = ev.y + this.offset[1] - rect.top
            Notepad.renderers.get(this.activeTool)?.onMove(this.liveContext, x, y)
        }
    }
    private pointerup(ev: PointerEvent) {
        if (ev.pointerType == "mouse" || ev.pointerType == "pen") {
            let rect = this.canvas.getBoundingClientRect()
            let x = ev.x + this.offset[0] - rect.left
            let y = ev.y + this.offset[1] - rect.top
            Notepad.renderers.get(this.activeTool)?.onEnd(this.liveContext, x, y)
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
            // TODO update sprite and redraw all sprites
        }
    }

    private onDeleteRenderElement(topic: string, event: Event) {
        if (event.type == "RenderElement") {
            let renderElement: RenderableData = event.data
            let rendererName = renderElement.type
            if (!Notepad.renderers.has(rendererName)) {
                alert("Unsupported renderer please let the dev know: " + rendererName)
            }
            // TODO update sprite and redraw all sprites
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
        this.liveCanvas.width = this.canvas.width
        this.canvas.height = this.mainDiv.clientHeight
        this.liveCanvas.height = this.canvas.height
    }
}
