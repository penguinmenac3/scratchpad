import {v4 as uuidv4} from 'uuid';
import { Eventbus } from "../../eventbus";
import { RenderableData, Renderable, Sprite } from "../interfaces";


export class Stroke implements Renderable {
    private points: number[][] = []

    render(element: RenderableData): Sprite {
        let width = element.bbox_xyxy[2] - element.bbox_xyxy[0]
        let height = element.bbox_xyxy[3] - element.bbox_xyxy[1]
        //let canvas = new OffscreenCanvas(width, height)
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let ctx = canvas.getContext("2d")!
        ctx.clearRect(0,0, width, height)
        ctx.beginPath()
        let first: boolean = true
        for (let pt of element.data) {
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

    onStart(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        liveCanvas.beginPath()
        liveCanvas.moveTo(x,y)
        this.points.push([x, y])
    }

    onMove(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        liveCanvas.lineTo(x, y)
        liveCanvas.stroke()
        this.points.push([x, y])
    }

    onEnd(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        liveCanvas.lineTo(x, y)
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
        minx -= 5
        miny -= 5
        maxx += 5
        maxy += 5
        let normalizedPoints = []
        for (let pt of this.points) {
            normalizedPoints.push([pt[0]-minx, pt[1]-miny])
        }
        this.points = []
        let element: RenderableData = {
            uuid: uuidv4(),
            type: "Stroke",
            layer: "10",
            bbox_xyxy: [minx, miny, maxx, maxy],
            data: normalizedPoints
        }
        Eventbus.send("render/updateElement", {
            "type": "RenderElement", "data": element, "allowNetwork": false
        })
    }
}
