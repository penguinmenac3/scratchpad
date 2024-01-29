import { Module } from '../../webui/module';
import { iconUpDown } from './toolbar/icons';
import { StaticTool } from './abstractTools';
import { DocumentAPI, PageElement } from '../interfaces';


export class InsertSpace extends StaticTool {
    private movingElements: PageElement[] = []
    private lastY: number = 0

    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconUpDown, "insertSpace")
    }

    onStart(documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, y: number): void {
        this.movingElements = []
        let document = documentAPI.getDocument()
        for (let [_uuid, element] of document) {
            if (y < element.bbox_xyxy[1]) {
                this.movingElements.push(element)
            }
        }
        this.lastY = y
    }
    onMove(documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, y: number): void {
        for (let element of this.movingElements) {
            let dx = y - this.lastY
            element.bbox_xyxy[1] += dx
            element.bbox_xyxy[3] += dx
        }
        this.lastY = y
        documentAPI.modifyElements(this.movingElements, true)
    }

    onEnd(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number): void {
        this.onMove(documentAPI, liveCanvas, x, y)
    }
}
