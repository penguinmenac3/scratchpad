import "./notepad.css"
import { Module } from "../webui/module"
import { Event, Eventbus } from "../webui/eventbus"
import { PageElement, Tool, Sprite, DocumentAPI, Document } from "./interfaces"
import { Toolbar } from './tools/toolbar/toolbar'
import { SimplePointerEventCallbacks, registerSimplePointerCallbacks } from "./simplePointerEvents"
import { toTwoDigits } from "../numbertools"
import { ConfirmCancelPopup, ExitablePopup } from "../webui/popup"
import { STRINGS } from "../language/default"
import { svgAddHeader, svgEncodePolyline, svgEncodeSPFComment } from "./svg"
import { ColorizableResizableTool } from "./tools/abstractTools"
import { Button, FormInput } from "../webui/form"


// All units are now in mm
let PAGE_WIDTH: number = 210
let PAGE_HEIGHT: number = 297

export class Notepad extends Module<HTMLDivElement> implements DocumentAPI, SimplePointerEventCallbacks {
    private tools = new Map<string, Tool>()
    private canvasContainer: Module<HTMLDivElement>
    private layers = new Map<string, string[]>()  // layerid -> element.uuids
    private textures = new Map<string, Sprite>()
    private pageElements = new Map<string, PageElement>()
    private canvas: HTMLCanvasElement
    private context: CanvasRenderingContext2D
    private offscreenCanvas: HTMLCanvasElement
    private offscreenContext: CanvasRenderingContext2D
    private activeTool: string = "pen"
    private isTouchAllowed: boolean = false
    private offset = [0.0, 0.0]
    private scale = 1.05
    private deviceScale = 1.0
    private lowestEntity = 0.0
    private saving: null | number = null
    private mousePos: [number, number] = [0.0, 0.0]
    private background: string = "grid"

    constructor(spf:string, cssClass: string = "", hasBack: boolean = false) {
        super("div", "", cssClass)
        this.add(new Toolbar(this.tools, hasBack))

        this.canvasContainer = new Module<HTMLDivElement>("div", "", "notepad-canvasContainer")
        this.add(this.canvasContainer)
        this.canvas = document.createElement("canvas")
        this.offscreenCanvas = document.createElement("canvas")
        this.canvasContainer.htmlElement.appendChild(this.canvas)
        this.context = this.canvas.getContext("2d", {desynchronized: true,})!
        this.offscreenContext = this.offscreenCanvas.getContext("2d")!

        window.onresize = this.resizeHandler.bind(this)

        Eventbus.register("toolbar/change", this.onToolbarChange.bind(this))

        this.canvas.oncontextmenu = () => false  // disable context menu on right click
        this.canvas.addEventListener('pointermove', this.computeRawPointerPosition.bind(this))
        registerSimplePointerCallbacks(this.canvas, this)
        this.canvas.addEventListener("wheel", this.scroll.bind(this), false)

        this.setData(spf)
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    public onBack(_isUnsaved: boolean): void {
        alert("Notepad::onBack has to be implemented by user.")
    }

    public onSave(_spf: string): void {
        alert("Notepad::onSave has to be implemented by user.")
    }

    public save() {
        this.onSave(this.getData())
        Eventbus.send("save", {"allowNetwork": false, "data": null, "type": "saved"})
    }

    public getData(): string {
        const pageElements = Array.from(this.getDocument().values())
        return JSON.stringify({"version": "1.1", "elements": pageElements})
    }

    public setData(spf: string) {
        this.deleteElements(this.getDocument().values(), false)
        if (!spf || spf == "") { return }
        let data = JSON.parse(spf)
        // Data from before has approximately a 1/7 conversion to mm format
        if (data.version === undefined) {
            for (const key in data) {
                let element: PageElement = data[key]
                let box = element.bbox_xyxy
                element.bbox_xyxy = [
                    toTwoDigits(box[0] / 7),
                    toTwoDigits(box[1] / 7),
                    toTwoDigits(box[2] / 7),
                    toTwoDigits(box[3] / 7),
                ]
                if (element.type == "pen" || element.type == "marker") {
                    element.data[1] = toTwoDigits(element.data[1] / 7)
                    for (const idx in element.data[2]) {
                        element.data[2][idx][0] = toTwoDigits(element.data[2][idx][0] / 7)
                        element.data[2][idx][1] = toTwoDigits(element.data[2][idx][1] / 7)
                    }
                }
            }
            data = {"version": "0", "elements": data}
            this.delayedAutosave()
        }
        if (data.version == "1") {
            for (const key in data.elements) {
                let element: PageElement = data.elements[key]
                let box = element.bbox_xyxy
                element.bbox_xyxy = [
                    toTwoDigits(box[0]),
                    toTwoDigits(box[1]),
                    toTwoDigits(box[2]),
                    toTwoDigits(box[3]),
                ]
                if (element.type == "pen" || element.type == "marker") {
                    element.data[1] = toTwoDigits(element.data[1])
                    for (const idx in element.data[2]) {
                        element.data[2][idx][0] = toTwoDigits(element.data[2][idx][0])
                        element.data[2][idx][1] = toTwoDigits(element.data[2][idx][1])
                    }
                }
            }
        }
        this.addElements(data.elements, false)
    }

    private delayedAutosave() {
        // delay the autosave, so that we are not constantly saving after each stroke
        // but only if user idles for some time
        if (this.saving != null) {
            window.clearTimeout(this.saving)
        }
        Eventbus.send("save", {"allowNetwork": false, "data": null, "type": "dirty"})
        this.saving = window.setTimeout(this.save.bind(this), 5000)
    }

    private scroll(ev: WheelEvent): void {
        if (ev.deltaY > 0) {
            this.changeScale(1.1, this.mousePos)
        } else {
            this.changeScale(1.0/1.1, this.mousePos)
        }
    }

    private changeScale(delta: number, center: [number, number]) {
        // Collect variables needed for offset update
        let oldScale = this.scale
        let rect = this.canvas.getBoundingClientRect()
        let w = rect.width * this.scale
        let h = rect.height * this.scale
        let dx = this.offset[0]
        let dy = this.offset[1]

        // Update scale
        this.scale *= delta
        if (this.scale < 0.25 * this.deviceScale) {
            this.scale = 0.25 * this.deviceScale
        }
        if (this.scale > 5.0 * this.deviceScale) {
            this.scale = 5.0 * this.deviceScale
        }
        
        // Update offset
        let s = this.scale / oldScale
        dx += (1 - s) * w * center[0]
        dy += (1 - s) * h * center[1]
        this.offset[0] = dx
        this.offset[1] = dy
        this.limitOffset()

        // Redraw to make changes visible
        this.requestRedraw()
    }

    onMouseStart(ev: PointerEvent, mouseBtn: number): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        if (mouseBtn == 0) {
            this.tools.get(this.activeTool)?.onStart(this, this.context, x, y, dx, dy, this.scale)
        }
    }
    onMouseMove(ev: PointerEvent, mouseBtn: number, previousEv: PointerEvent): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        if (mouseBtn == 0) {
            this.tools.get(this.activeTool)?.onMove(this, this.context, x, y, dx, dy, this.scale)
        }
        if (mouseBtn == 1 || mouseBtn == 2) {
            let rawPreviousPos = this.computeRawPointerPosition(previousEv)
            let previousPos = this.computeVirtualPosition(rawPreviousPos)
            this.offset[0] += previousPos.x - x
            this.offset[1] += previousPos.y - y
            this.limitOffset()
            this.requestRedraw()
        }
    }
    onMouseEnd(ev: PointerEvent, mouseBtn: number, _previousEv: PointerEvent): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        if (mouseBtn == 0) {
            this.tools.get(this.activeTool)?.onEnd(this, this.context, x, y, dx, dy, this.scale)
        }
    }
    onPenStart(ev: PointerEvent): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        this.tools.get(this.activeTool)?.onStart(this, this.context, x, y, dx, dy, this.scale)
    }
    onPenMove(ev: PointerEvent, _previousEv: PointerEvent): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        this.tools.get(this.activeTool)?.onMove(this, this.context, x, y, dx, dy, this.scale)
    }
    onPenEnd(ev: PointerEvent, _previousEv: PointerEvent): void {
        let rawPos = this.computeRawPointerPosition(ev)
        let { x, y, dx, dy } = this.computeVirtualPosition(rawPos)
        this.tools.get(this.activeTool)?.onEnd(this, this.context, x, y, dx, dy, this.scale)
    }
    onTouchStart(_ev: TouchEvent): void {}
    onTouchMove(ev: TouchEvent, previousEv: TouchEvent): void {
        if (this.isTouchAllowed) {
            let rawPos = this.computeRawTouchPositions(ev)[0]
            let { x, y } = this.computeVirtualPosition(rawPos as any)
            let rawPreviousPos = this.computeRawTouchPositions(previousEv)[0]
            let previousPos = this.computeVirtualPosition(rawPreviousPos as any)
            this.offset[0] += previousPos.x - x
            this.offset[1] += previousPos.y - y
            this.limitOffset()
            this.requestRedraw()
        }
    }
    onTouchEnd(_ev: TouchEvent, _previousEv: TouchEvent): void {}
    onPinchStart(_ev: TouchEvent): void {}
    onPinchMove(ev: TouchEvent, previousEv: TouchEvent): void {
        if (this.isTouchAllowed) {
            let [rawP1, rawP2] = this.computeRawTouchPositions(ev)
            let [rawP3, rawP4] = this.computeRawTouchPositions(previousEv)
            let dist1 = Math.sqrt((rawP1[0]-rawP2[0])**2 + (rawP1[1]-rawP2[1])**2)
            let dist2 = Math.sqrt((rawP3[0]-rawP4[0])**2 + (rawP3[1]-rawP4[1])**2)
            let c0: [number, number] = [(rawP1[0] + rawP2[0]) / 2, (rawP1[1] + rawP2[1]) / 2]
            let c1: [number, number] = [(rawP3[0] + rawP4[0]) / 2, (rawP3[1] + rawP4[1]) / 2]
            
            let delta = dist2 / dist1
            if (!isNaN(delta)) {
                let { x, y } = this.computeVirtualPosition(c0)
                let previousPos = this.computeVirtualPosition(c1)
                this.offset[0] += previousPos.x - x
                this.offset[1] += previousPos.y - y

                let rect = this.canvas.getBoundingClientRect()
                this.changeScale(delta, [c0[0] / rect.width, c0[1] / rect.height])
            }
        }
    }
    onPinchEnd(_ev: TouchEvent, _previousEv: TouchEvent): void {}

    private computeRawPointerPosition(ev: PointerEvent): [number, number] {
        let rect = this.canvas.getBoundingClientRect()
        let px = (ev.x - rect.left)
        let py = (ev.y - rect.top)
        // Save where mouse is pointing at for zoom
        if (ev.pointerType == "mouse") {
            this.mousePos[0] = px / rect.width
            this.mousePos[1] = py / rect.height
        }
        return [px, py]
    }

    private computeRawTouchPositions(ev: TouchEvent): number[][] {
        let rect = this.canvas.getBoundingClientRect()
        let positions = []
        for (let i = 0; i < ev.targetTouches.length; i++) {
            let touch = ev.targetTouches[i]
            let px = (touch.clientX - rect.left)
            let py = (touch.clientY - rect.top)
            positions.push([px, py])
        }
        return positions
    }

    private computeVirtualPosition(position: [number, number]) {
        let dx = this.offset[0]
        let dy = this.offset[1]
        let x = position[0] * this.scale + dx
        let y = position[1] * this.scale + dy
        return { x, y, dx, dy }
    }

    private limitOffset() {
        if (PAGE_WIDTH / this.scale < this.canvas.width) {
            this.offset[0] = PAGE_WIDTH / 2 - this.canvas.width / 2 * this.scale
        } else {
            this.offset[0] = Math.min(this.offset[0], PAGE_WIDTH - this.scale * this.canvas.width * 19 / 20)
            this.offset[0] = Math.max(this.offset[0], - this.scale * this.canvas.width / 20)
        }
        this.offset[1] = Math.min(this.offset[1], this.lowestEntity - this.scale * this.canvas.height / 20)
        this.offset[1] = Math.max(this.offset[1], - this.scale * this.canvas.height / 20)
    }

    getDocument(): Document {
        return this.pageElements
    }

    addElements(elements: Iterable<PageElement>, autosave: boolean = true): void {
        this.modifyElements(elements, false, autosave)
    }

    modifyElements(elements: Iterable<PageElement>, skipRender: boolean = false, autosave: boolean = true): void {
        if (!skipRender) {
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
                if (list.indexOf(element.uuid) == -1) {
                    list.push(element.uuid)
                }
            }
        }
        this.lowestEntity = 0
        for (let [_uuid, element] of this.pageElements) {
            this.lowestEntity = Math.max(element.bbox_xyxy[3], this.lowestEntity)
        }
        this.requestRedraw()
        if (autosave) {
            this.delayedAutosave()
        }
    }

    deleteElements(elements: Iterable<PageElement>, autosave: boolean = true): void {
        for (let element of elements) {
            this.pageElements.delete(element.uuid)
            this.textures.delete(element.uuid)
            let list = this.layers.get(element.layer)!
            let idx = list.indexOf(element.uuid)
            if (idx > -1) {
                list.splice(idx, 1)
            }
        }
        this.requestRedraw()
        if (autosave) {
            this.delayedAutosave()
        }
    }

    requestRedraw() {
        // Render as a callback to animation frame to avoid flicker
        window.requestAnimationFrame(this.render.bind(this))
    }

    private render() {
        let width = this.canvas.width
        let height = this.canvas.height
        let color = getComputedStyle(document.body).getPropertyValue('--color-base');
        this.offscreenContext.fillStyle = color
        this.offscreenContext.fillRect(0, 0, width, height)
        let layers = Array.from(this.layers.keys())
        layers = layers.sort()
        let dx = this.offset[0]
        let dy = this.offset[1]

        // Draw page width limit
        for (let i = 0; i < 2; i++) {
            let xLimit = (PAGE_WIDTH * i - dx) / this.scale
            this.offscreenContext.beginPath()
            this.offscreenContext.moveTo(xLimit, 0)
            this.offscreenContext.lineTo(xLimit, height)
            let color = getComputedStyle(document.body).getPropertyValue('--color-bad-font')
            this.offscreenContext.strokeStyle = color + "AA"
            this.offscreenContext.lineWidth = 2
            this.offscreenContext.stroke()
            this.offscreenContext.closePath()
        }
        let N = Math.ceil(this.canvas.height / (PAGE_HEIGHT / this.scale))
        let idxOffset = Math.floor(dy / PAGE_HEIGHT) + 1
        for (let i = 0; i < N; i++) {
            let yLimit = (PAGE_HEIGHT * (i + idxOffset) - dy) / this.scale
            this.offscreenContext.beginPath()
            this.offscreenContext.moveTo(0, yLimit)
            this.offscreenContext.lineTo(width, yLimit)
            let color = getComputedStyle(document.body).getPropertyValue('--color-bad-font')
            this.offscreenContext.strokeStyle = color + "AA"
            this.offscreenContext.lineWidth = 2
            this.offscreenContext.stroke()
            this.offscreenContext.closePath()
        }

        // Insert background
        if (this.background == "grid"){
            this.drawGrid(this.offscreenContext, dx, dy, width, height)
        } else if (this.background == "lines") {
            this.drawLines(this.offscreenContext, dx, dy, width, height)
        }

        // Draw content
        for (let layer of layers) {
            let uuids = this.layers.get(layer)!
            for (let uuid of uuids) {
                let renderable = this.pageElements.get(uuid)!
                let sprite = this.textures.get(uuid)!
                let [x1, y1, x2, y2] = renderable.bbox_xyxy
                // px * this.scale + (1-this.scale) * rect.width / 2 + this.offset[0]
                x1 = (x1 - dx) / this.scale
                y1 = (y1 - dy) / this.scale
                x2 = (x2 - dx) / this.scale
                y2 = (y2 - dy) / this.scale
                // Only render if box intersects with view area
                if (((0 <= x1 && x1 <= width) &&
                    (0 <= y1 && y1 <= height)) ||
                    ((0 <= x2 && x2 <= width) &&
                        (0 <= y2 && y2 <= height))) {
                    this.offscreenContext.drawImage(sprite, x1, y1, x2 - x1, y2 - y1)
                }
            }
        }
        this.context.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width, this.canvas.height)
    }

    private drawLines(context: CanvasRenderingContext2D, _dx: number, dy: number, width: number, height: number) {
        let spacing = 10  // mm
        let Nylines = Math.ceil(height / (spacing / this.scale))
        let yidxOffset = Math.floor(dy / 100) + 1
        for (let i = 0; i < Nylines; i++) {
            let yLimit = (spacing * (i + yidxOffset) - dy) / this.scale
            context.beginPath()
            context.moveTo(0, yLimit)
            context.lineTo(width, yLimit)
            let color = getComputedStyle(document.body).getPropertyValue('--color-base-hover')
            context.strokeStyle = color + "AA"
            context.lineWidth = 1
            context.stroke()
            context.closePath()
        }
    }

    private drawGrid(context: CanvasRenderingContext2D, dx: number, dy: number, width: number, height: number) {
        let spacing = 5.0 // mm
        let Nylines = Math.ceil(height / (spacing / this.scale))
        let yidxOffset = Math.floor(dy / spacing) + 1
        for (let i = 0; i < Nylines; i++) {
            let yLimit = (spacing * (i + yidxOffset) - dy) / this.scale
            context.beginPath()
            context.moveTo(0, yLimit)
            context.lineTo(width, yLimit)
            let color = getComputedStyle(document.body).getPropertyValue('--color-base-hover')
            context.strokeStyle = color + "AA"
            context.lineWidth = 1
            context.stroke()
            context.closePath()
        }
        let Nxlines = Math.ceil(width / (spacing / this.scale))
        let xidxOffset = Math.floor(dx / spacing) + 1
        for (let i = 0; i < Nxlines; i++) {
            let xLimit = (spacing * (i + xidxOffset) - dx) / this.scale
            context.beginPath()
            context.moveTo(xLimit, 0)
            context.lineTo(xLimit, height)
            let color = getComputedStyle(document.body).getPropertyValue('--color-base-hover')
            context.strokeStyle = color + "AA"
            context.lineWidth = 1
            context.stroke()
            context.closePath()
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
        } else if (event.type == "string" && event.data == "save") {
            if (this.saving != null) {
                window.clearTimeout(this.saving)
            }
            this.save()
         } else if (event.type == "string" && event.data == "back") {
            if (this.saving != null) {
                window.clearTimeout(this.saving)
                this.onBack(true)
            } else {
                this.onBack(false)
            }
        } else if (event.type == "string" && event.data == "export") {
            let timestamp = new Date().toISOString().substring(0, 19).replace("T", "_").replaceAll(":", "")
            let svg = this.getSVG()
            this.saveToLocalTextFile(svg, timestamp + "_Note.spf.svg")
        }  else if (event.type == "string" && event.data == "import") {
            let popup = new ExitablePopup()
            popup.add(new Module<HTMLDivElement>("div", STRINGS.NOTEPAD_IMPORT_QUESTION, "notepad-importHeader"))
            let importFile = new FormInput("importFile", "*.spf.svg or *.spf", "file", "notepad-importFile")
            popup.add(importFile)
            let button = new Button(STRINGS.NOTEPAD_IMPORT_CONFIRM, "notepad-importConfirm")
            let that = this
            button.onClick = () => {
                if (importFile.htmlElement.files?.length) {
                    let fileObject = importFile.htmlElement.files[0]
                    if (!fileObject.name.endsWith(".spf.svg") && !fileObject.name.endsWith(".spf")) {
                        alert(STRINGS.NOTEPAD_IMPORT_UNSUPPORTED_FILE)
                        return
                    }
                    var reader = new FileReader()
                    reader.onload = function(e)
                    {
                        let target = e.target
                        if (target != null) {
                            let content: string = target.result as string
                            if (fileObject.name.endsWith(".spf.svg")) {
                                let spfStart = content.indexOf("<!--\n")
                                let spfEnd = content.indexOf("\n-->")
                                content = content.slice(spfStart + 5, spfEnd)
                            }
                            that.setData(content)
                            Eventbus.send("save", {"allowNetwork": false, "data": null, "type": "dirty"})
                            popup.dispose()
                        }
                    };
                    reader.readAsBinaryString(fileObject);
                }
            }
            popup.add(button)
            popup.show()
        } else if (event.type == "string" && event.data == "clear") {
            let innerClass = "popupContent"
            let containerClass = 'popupContainer'
            let popup = new ConfirmCancelPopup(innerClass, containerClass, STRINGS.NOTEPAD_CLEAR_QUESTION, STRINGS.NOTEPAD_CLEAR_CANCEL, STRINGS.NOTEPAD_CLEAR_CONFIRM)
            popup.onConfirm = () => {}
            popup.onCancel = () => {
                this.deleteElements(this.getDocument().values(), false)
                Eventbus.send("save", {"allowNetwork": false, "data": null, "type": "dirty"})
            }
            popup.show()
        }
    }

    private getSVG(): string {
        let pixels_per_mm = 1
        let maxx = 0
        let maxy = 0
        let minx = 100000
        let miny = 100000
        let svg = ""
        svg += svgEncodeSPFComment(this.getData())
        let layers = Array.from(this.layers.keys())
        layers = layers.sort()
        // Get boundaries of all objects to find canvas sizes
        for (let layer of layers) {
            let uuids = this.layers.get(layer)!
            for (let uuid of uuids) {
                let renderable = this.pageElements.get(uuid)!
                console.log(renderable.type)
                let [x1, y1, x2, y2] = renderable.bbox_xyxy
                if (x2 > maxx) maxx = x2
                if (y2 > maxy) maxy = y2
                if (x1 < minx) minx = x1
                if (y1 < miny) miny = y1
            }
        }
        // Convert elements to SVG elements
        for (let layer of layers) {
            let uuids = this.layers.get(layer)!
            for (let uuid of uuids) {
                let renderable = this.pageElements.get(uuid)!
                console.log(renderable.type)
                let [x1, y1, _x2, _y2] = renderable.bbox_xyxy
                let toolName = renderable.type
                if (!this.tools.has(toolName)) {
                    alert("Unsupported tool please let the dev know: " + toolName)
                }
                if (toolName == "pen" || toolName == "marker")  {
                    let tool = this.tools.get(toolName)! as ColorizableResizableTool
                    let color = getComputedStyle(document.body).getPropertyValue('--color-' + renderable.data[0] + '-font');
                    color = color + tool.getTransparancy()
                    let width = renderable.data[1] * pixels_per_mm
                    let points: number[][] = []
                    for (let pt of renderable.data[2]) {
                        let x = x1 + pt[0] * pixels_per_mm
                        let y = y1 + pt[1] * pixels_per_mm
                        points.push([x - minx,y - miny])
                    }
                    let svg_part = svgEncodePolyline(points, color, width)
                    svg += svg_part
                }
            }
        }
        return svgAddHeader(svg, (maxx-minx), (maxy-miny))
    }

    private saveToLocalTextFile(fileContent: string, fileName: string) {
        let blob = new Blob([fileContent], {type:'text/plain'})
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        a.download = typeof(fileName) === 'string' ? fileName : 'download'
        a.target = '_blank'
        a.click()
        a.remove()
    }

    protected resizeHandler() {
        this.canvas.width = this.canvasContainer.htmlElement.clientWidth
        this.canvas.height = this.canvasContainer.htmlElement.clientHeight
        this.offscreenCanvas.width = this.canvas.width
        this.offscreenCanvas.height = this.canvas.height
        let oldDeviceScale = this.deviceScale
        this.deviceScale = PAGE_WIDTH / this.canvas.width
        this.scale = this.scale / oldDeviceScale * this.deviceScale
        this.limitOffset()
        this.requestRedraw()
        console.log("resized")
    }
}
