import "./notepad.css"

export function setupNotepad(element: HTMLDivElement) {
    element.innerHTML = `
    <canvas id="canvas" />
    `
    new Canvas(
        document.querySelector<HTMLCanvasElement>('#canvas')!,
        element
    )
}


class Canvas {
    constructor(private canvas: HTMLCanvasElement, private parent: HTMLDivElement) {
        window.onresize = this.resizeHandler.bind(this)
        this.resizeHandler()
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    private resizeHandler() {
        this.canvas.width = this.parent.clientWidth;
        this.canvas.height = this.parent.clientHeight;
    }
}
