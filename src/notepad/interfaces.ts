export interface RenderableData {
    uuid: string
    type: string
    bbox_xyxy: number[]
    data: any
}

export type Sprite = CanvasRenderingContext2D  // TODO find what the type actualy is for a sprite. Renderers create sprites and the notepad desides when rerender must be done.

export interface Renderable {    
    render(element: RenderableData): Sprite
    onStart(liveCanvas: Sprite, x: number, y: number): void
    onMove(liveCanvas: Sprite, x: number, y: number): void
    onEnd(liveCanvas: Sprite, x: number, y: number): void
}
