import {v4 as uuidv4} from 'uuid';
import { Eventbus } from "../../eventbus";
import { RenderableData, Renderable, Sprite } from "../interfaces";


export class Text implements Renderable {
    private uuid: string = ""
    private text: string = ""
    private position: number[] = [0.0, 0.0]

    render(element: RenderableData): Sprite {
        let width = element.bbox_xyxy[2] - element.bbox_xyxy[0]
        let height = element.bbox_xyxy[3] - element.bbox_xyxy[1]
        //let canvas = new OffscreenCanvas(width, height)
        let canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        let ctx = canvas.getContext("2d")!
        ctx.clearRect(0,0, width, height)
        
        return canvas
    }

    onStart(_liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {
        // TODO Find if we clicked on existing text. If so go into select mode.

        // TODO register keyboard listeners or how to
        // actually handle input and the cursor and marking of text?
    }

    onMove(_liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}

    onEnd(_liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        if (this.uuid == "") {
            this.uuid = uuidv4()
            this.position = [x, y]
        }
    }

    write(): void {
        if (this.text == "") return
        let [minx, miny] = this.position
        let [maxx, maxy] = this.position // TODO compute
        let element: RenderableData = {
            uuid: this.uuid,
            type: "text",
            layer: "10",
            bbox_xyxy: [minx, miny, maxx, maxy],
            data: this.text
        }
        Eventbus.send("render/updateElement", {
            "type": "RenderElement", "data": element, "allowNetwork": false
        })
    }

    activate(): void {}
    deactivate(): void {
        this.write()
        this.text = "";
        this.uuid = "";
        this.position = [0.0, 0.0];
    }
}
