// Specifications around a document
export let LAYER_BG = "0"
export let LAYER_IMAGE = "1"
export let LAYER_MARKER = "2"
export let LAYER_FG = "3"
export interface PageElement {
    uuid: string
    type: string
    layer: string
    bbox_xyxy: number[]
    data: any
}
export type Document = Map<string, PageElement>  // uuid -> element
export interface DocumentAPI {
    // Modify content of document
    addElements(element: PageElement[]): void
    modifyElements(element: PageElement[]): void
    deleteElements(element: PageElement[]): void
    // Get the documents to browse them (despite being modifiable do not modify direclty!)
    getDocument(): Document
    redraw(): void
}

// Specifications around tools which generate or modify page elements
export type Sprite = CanvasImageSource
export interface Tool {
    register(tools: Map<string, Tool>): void
    // Render a page element into a sprite
    render(element: PageElement): Sprite
    // Handle user interaction with the canvas.
    onStart(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void
    onMove(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void
    onEnd(documentAPI: DocumentAPI, liveCanvas: CanvasRenderingContext2D, x: number, y: number, offsetX: number, offsetY: number, scale: number): void
    // When a tool is selected or deselected you might need to do some preparation.
    activate(): void
    deactivate(): void
}
