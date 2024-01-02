import { Module } from '../../webui/module';
import { iconErasor } from './toolbar/icons';
import { StaticTool } from './abstractTools';
import { DocumentAPI, PageElement } from '../interfaces';
import { BBox, Line, doBoundingBoxesIntersect, doLinesIntersect, getBBox } from './line_intersection';


let ERASABLE_ELEMENTS: string[] = [
    "pen",
    "marker"
]

export class Erasor extends StaticTool {
    private x0: number = 0
    private y0: number = 0

    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconErasor, "erasor")
    }

    onStart(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, x: number, y: number, _offsetX: number, _offsetY: number, _scale: number): void {
        this.x0 = x
        this.y0 = y
    }

    onMove(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, _scale: number): void {
        if (x != this.x0 && y != this.y0) {
            // We first identify what to remove and then remove it
            let toRemove: PageElement[] = []
            let erasorLine: Line = [[this.x0,this.y0],[x,y]]
            this.drawDebugLine(liveCanvas, erasorLine, offsetX, offsetY, "#FF000033", 1);
            documentAPI.getDocument().forEach((element, _key) => {
                // Early exit so we save computations for non erazable elements
                if (!ERASABLE_ELEMENTS.includes(element.type)) return
                let boxElem: BBox = [[element.bbox_xyxy[0], element.bbox_xyxy[1]],[element.bbox_xyxy[2],element.bbox_xyxy[3]]]
                if (doBoundingBoxesIntersect(getBBox(erasorLine), boxElem)) {
                    // For each line segment check if it intersects
                    let normalizedPoints: number[][] = element.data[2]
                    let minx = element.bbox_xyxy[0]
                    let miny = element.bbox_xyxy[1]
                    for (let i = 1; i < normalizedPoints.length; i++) {
                        let linesegment = [normalizedPoints[i-1], normalizedPoints[i]]
                        linesegment = [
                            [linesegment[0][0] + minx, linesegment[0][1] + miny],
                            [linesegment[1][0] + minx, linesegment[1][1] + miny],
                        ]
                        if (doBoundingBoxesIntersect(getBBox(erasorLine), getBBox(linesegment))) {
                            if (doLinesIntersect(linesegment, erasorLine)) {
                                //this.drawDebugLine(liveCanvas, erasorLine, offsetX, offsetY, "#FF0000FF", 2)
                                //this.drawDebugLine(liveCanvas, linesegment, offsetX, offsetY, "#00FF00FF", 2)
                                toRemove.push(element)
                                return
                            }
                        }
                    }
                }
            })
            if (toRemove.length > 0) {
                documentAPI.deleteElements(toRemove)
            }
            this.x0 = x
            this.y0 = y
        }
    }

    private drawDebugLine(liveCanvas: CanvasRenderingContext2D, line: Line, offsetX: number, offsetY: number, color: string, width: number) {
        liveCanvas.beginPath();
        liveCanvas.moveTo(line[0][0] - offsetX, line[0][1] - offsetY);
        liveCanvas.lineTo(line[1][0] - offsetX, line[1][1] - offsetY);
        liveCanvas.strokeStyle = color;
        liveCanvas.lineWidth = width;
        liveCanvas.stroke();
        liveCanvas.closePath();
    }

    onEnd(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void {
        this.onMove(documentAPI, liveCanvas, x, y, offsetX, offsetY, scale)
        documentAPI.redraw()
    }
}
