import {v4 as uuidv4} from 'uuid';
import { PageElement, Sprite, DocumentAPI, LAYER_FG } from "../interfaces";
import { Module } from '../../webui/module';
import { iconPen } from './toolbar/icons';
import { ColorizableResizableTool } from './abstractTools';


export class Pen extends ColorizableResizableTool {
    private points: number[][] = []

    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconPen, "pen", "brand", 2, "FF", 2, 5, true)
    }

    render(element: PageElement): Sprite {
        let scale = 2
        let width = (element.bbox_xyxy[2] - element.bbox_xyxy[0]) * scale
        let height = (element.bbox_xyxy[3] - element.bbox_xyxy[1]) * scale
        //let canvas = new OffscreenCanvas(width, height)
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let ctx = canvas.getContext("2d")!
        ctx.clearRect(0,0, width, height)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + element.data[0] + '-font');
        ctx.strokeStyle = color + this.transparency
        ctx.lineWidth = element.data[1] * scale
        ctx.beginPath()
        let first: boolean = true
        for (let pt of element.data[2]) {
            let x = pt[0] * scale
            let y = pt[1] * scale
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

    onStart(_documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void {
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth / scale
        liveCanvas.beginPath()
        liveCanvas.moveTo((x - offsetX) / scale, (y - offsetY) / scale)
        this.points.push([x, y])
    }

    onMove(_documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void {
        liveCanvas.lineTo((x - offsetX) / scale, (y - offsetY) / scale)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth / scale
        liveCanvas.stroke()
        this.points.push([x, y])
    }

    onEnd(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void {
        liveCanvas.lineTo((x - offsetX) / scale, (y - offsetY) / scale)
        let color = getComputedStyle(document.body).getPropertyValue('--color-' + this.color + '-font')
        liveCanvas.strokeStyle = color + this.transparency
        liveCanvas.lineWidth = this.lineWidth / scale
        liveCanvas.stroke()
        liveCanvas.closePath()
        this.points.push([x, y])
        let [normalizedPoints, bbox] = this.normalizePoints(this.points, this.lineWidth)
        this.points = []
        documentAPI.addElements([{
            uuid: uuidv4(),
            type: this.id,
            layer: LAYER_FG,
            bbox_xyxy: bbox,
            data: [this.color, this.lineWidth, normalizedPoints]
        }])
    }

    normalizePoints(points: number[][], lineWidth: number): [number[][], number[]] {
        let x = points[0][0]
        let y = points[0][1]
        let [minx, miny, maxx, maxy] = [x, y, x, y]
        for (let pt of points) {
            minx = Math.min(minx, pt[0])
            miny = Math.min(miny, pt[1])
            maxx = Math.max(maxx, pt[0])
            maxy = Math.max(maxy, pt[1])
        }
        minx -= 5 + lineWidth
        miny -= 5 + lineWidth
        maxx += 5 + lineWidth
        maxy += 5 + lineWidth
        let normalizedPoints = []
        for (let pt of points) {
            normalizedPoints.push([pt[0]-minx, pt[1]-miny])
        }
        return [normalizedPoints, [minx, miny, maxx, maxy]]
    }

    activate(): void {}
    deactivate(): void {}
}
