import './toolbar.css'
import { ToolSelector } from './toolselector'
import { Spacer } from './spacer'


export class Toolbar {
  public constructor(
    public mainDiv: HTMLDivElement) {
    new ToolSelector(mainDiv, "back", '<i class="fa fa-arrow-left" aria-hidden="true"></i>')
    new ToolSelector(mainDiv, "togglePreview", '<i class="fa fa-columns" aria-hidden="true"></i>')
    new Spacer(mainDiv)
    new ToolSelector(mainDiv, "pen", '<i class="fa fa-circle" aria-hidden="true"></i>')
    new ToolSelector(mainDiv, "marker", '<i class="fa fa-square" aria-hidden="true"></i>')
    new ToolSelector(mainDiv, "erasor", '<i class="fa fa-eraser" aria-hidden="true"></i>')
    new ToolSelector(mainDiv, "text", '<i class="fa fa-font" aria-hidden="true"></i>')
    new ToolSelector(mainDiv, "tool_settings", '<i class="fa fa-gear" aria-hidden="true"></i>')
    new Spacer(mainDiv)
    new ToolSelector(mainDiv, "select", '<i class="fa fa-square-o" aria-hidden="true"></i>')

    new ToolSelector(mainDiv, "settings", '<i class="fa fa-bars" aria-hidden="true"></i>', true)
    new Spacer(mainDiv, true)
    new ToolSelector(mainDiv, "redo", '<i class="fa fa-repeat" aria-hidden="true"></i>', true)
    new ToolSelector(mainDiv, "undo", '<i class="fa fa-undo" aria-hidden="true"></i>', true)
    //new Spacer(mainDiv, true)
  }
}
