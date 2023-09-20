import { Event, Eventbus } from "../../webui/eventbus";
import { DocumentAPI, PageElement, Sprite, Tool, } from "../interfaces";
import { Module } from '../../webui/module';
import { ToolButton, ToolColorSetting, ToolPopup, ToolSizeSetting } from './toolbar/toolbutton';
import { iconPen } from './toolbar/icons';


export abstract class StaticTool implements Tool {
    constructor(toolbar: Module<HTMLDivElement>,
            icon: string,
            protected id: string,
            isDefaultTool: boolean = false,
        ) {
        let toolbutton = new ToolButton("tool_" + this.id, true, icon)
        toolbar.add(toolbutton)
        if (isDefaultTool)
            toolbutton.onClick()
    }

    register(tools: Map<string, Tool>): void {
        tools.set(this.id, this)
    }

    render(element: PageElement): Sprite {
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

    onStart(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    onMove(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    onEnd(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    activate(): void {}
    deactivate(): void {}
}


export abstract class ColorizableResizableTool implements Tool {
    constructor(toolbar: Module<HTMLDivElement>,
            icon: string,
            protected id: string,
            protected color: string,
            protected lineWidth: number,
            protected transparency: string,
            smallSize: number,
            largeSize: number,
            isDefaultTool: boolean = false,
        ) {
        let toolbutton = new ToolButton("tool_" + this.id, true, icon)
        toolbar.add(toolbutton)
        if (isDefaultTool)
            toolbutton.onClick()
        toolbutton.addPopup(new ToolPopup([
            new ToolColorSetting(icon, "base", "base" == color),
            new ToolColorSetting(icon, "brand", "brand" == color),
            new ToolColorSetting(icon, "accent", "accent" == color),
            new ToolColorSetting(icon, "good", "good" == color),
            new ToolColorSetting(icon, "bad", "bad" == color),
            new ToolSizeSetting("o", smallSize),
            new ToolSizeSetting("O", largeSize),
        ]))
        Eventbus.register("toolbar/setting", this.onSettingChanged.bind(this))
    }
    
    protected onSettingChanged(topic: string, event: Event): void {
        if (topic == "toolbar/setting" && event.type == "setting"){
            if (event.data.id == "tool_" + this.id) {
                if (event.data.color) {
                    this.color = event.data.color
                }
                if (event.data.size) {
                    this.lineWidth = event.data.size
                }
            }
        }
    }
    
    register(tools: Map<string, Tool>): void {
        tools.set(this.id, this)
    }
    
    render(element: PageElement): Sprite {
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

    onStart(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    onMove(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    onEnd(_documentAPI: DocumentAPI, _liveCanvas: CanvasRenderingContext2D, _x: number, _y: number): void {}
    activate(): void {}
    deactivate(): void {}
}
