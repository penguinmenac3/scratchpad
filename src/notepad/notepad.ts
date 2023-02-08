import "./notepad.css"
import { PagePreview } from "../page_preview/page_preview"


export class Notepad {
    private canvas: HTMLCanvasElement

    constructor(
            private mainDiv: HTMLDivElement,
            private pagePreview: PagePreview) {
        this.mainDiv.innerHTML = `<canvas id="canvas" />`
        this.canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
        window.onresize = this.resizeHandler.bind(this)
        this.resizeHandler()
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    public toggleFullWidth() {
        if (this.mainDiv.classList.contains("full-width")) {
            this.mainDiv.classList.remove("full-width")
        } else {
            this.mainDiv.classList.add("full-width")
        }
        this.resizeHandler()
        window.setTimeout(this.resizeHandler.bind(this), 100)
    }

    private resizeHandler() {
        this.canvas.width = this.mainDiv.clientWidth;
        this.canvas.height = this.mainDiv.clientHeight;
    }
}
