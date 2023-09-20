import {v4 as uuidv4} from 'uuid';
import { PageElement, Sprite, DocumentAPI, LAYER_MARKER } from "../interfaces";
import { Module } from '../../webui/module';
import { iconMarker } from './toolbar/icons';
import { ColorizableResizableTool } from './abstractTools';


export class Marker extends ColorizableResizableTool {
    private points: number[][] = []

    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconMarker, "marker", "accent", 20, "77", 20, 50)
    }

    render(element: PageElement): Sprite {
        let width = element.bbox_xyxy[2] - element.bbox_xyxy[0]
        let height = element.bbox_xyxy[3] - element.bbox_xyxy[1]
        //let canvas = new OffscreenCanvas(width, height)
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let ctx = canvas.getContext("2d")!
        ctx.clearRect(0,0, width, height)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + element.data[0] + '-font');
        ctx.strokeStyle = color + this.transparency
        ctx.lineWidth = element.data[1]
        ctx.beginPath()
        let first: boolean = true
        for (let pt of element.data[2]) {
            let x = pt[0]
            let y = pt[1]
            if (first) {
                ctx.moveTo(x, y)
                first = false
            } else {
                ctx.lineTo(x, y)
                //ctx.bezierCurveTo()
            }
        }
        ctx.stroke()
        ctx.closePath()
        return canvas
        //return ctx.getImageData(0,0,canvas.width, canvas.height)
    }

    onStart(_documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth
        liveCanvas.beginPath()
        liveCanvas.moveTo(x,y)
        this.points.push([x, y])
    }

    onMove(_documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        liveCanvas.lineTo(x, y)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth
        liveCanvas.stroke()
        this.points.push([x, y])
    }

    onEnd(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        liveCanvas.lineTo(x, y)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth
        liveCanvas.stroke()
        liveCanvas.closePath()
        this.points.push([x, y])
        let [minx, miny, maxx, maxy] = [x, y, x, y]
        for (let pt of this.points) {
            minx = Math.min(minx, pt[0])
            miny = Math.min(miny, pt[1])
            maxx = Math.max(maxx, pt[0])
            maxy = Math.max(maxy, pt[1])
        }
        minx -= 5 + this.lineWidth
        miny -= 5 + this.lineWidth
        maxx += 5 + this.lineWidth
        maxy += 5 + this.lineWidth
        let normalizedPoints = []
        for (let pt of this.points) {
            normalizedPoints.push([pt[0]-minx, pt[1]-miny])
        }
        this.points = []
        documentAPI.addElements([{
            uuid: uuidv4(),
            type: this.id,
            layer: LAYER_MARKER,
            bbox_xyxy: [minx, miny, maxx, maxy],
            data: [this.color, this.lineWidth, normalizedPoints]
        }])
    }

    activate(): void {}
    deactivate(): void {}
}
