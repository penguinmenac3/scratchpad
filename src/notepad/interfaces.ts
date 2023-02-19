export interface RenderableData {
    uuid: string
    type: string
    layer: string
    bbox_xyxy: number[]
    data: any
}

export type Sprite = CanvasImageSource  // TODO find what the type actualy is for a sprite. Renderers create sprites and the notepad desides when rerender must be done.

export interface Renderable {    
    render(element: RenderableData): Sprite
    onStart(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void
    onMove(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void
    onEnd(liveCanvas: CanvasRenderingContext2D, x: number, y: number): void
}
