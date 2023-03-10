import './toolbar.css'
import { ToolButton } from './toolbutton'
import { Spacer } from './spacer'


export class Toolbar {
  public constructor(
    public mainDiv: HTMLDivElement) {
    new ToolButton(mainDiv, "back", false, '<i class="fa fa-arrow-left" aria-hidden="true"></i>')
    new ToolButton(mainDiv, "togglePreview", false, '<i class="fa fa-columns" aria-hidden="true"></i>')
    new Spacer(mainDiv)
    new ToolButton(mainDiv, "tool_pen", true, '<i class="fa fa-circle" aria-hidden="true"></i>').onClick()
    new ToolButton(mainDiv, "tool_marker", true, '<i class="fa fa-square" aria-hidden="true"></i>')
    new ToolButton(mainDiv, "tool_erasor", true, '<i class="fa fa-eraser" aria-hidden="true"></i>')
    new ToolButton(mainDiv, "tool_text", true, '<i class="fa fa-font" aria-hidden="true"></i>')
    new ToolButton(mainDiv, "settings_tools", false, '<i class="fa fa-gear" aria-hidden="true"></i>')
    new Spacer(mainDiv)
    new ToolButton(mainDiv, "tool_select", true, '<i class="fa fa-square-o" aria-hidden="true"></i>')

    new ToolButton(mainDiv, "settings_document", false, '<i class="fa fa-bars" aria-hidden="true"></i>', true)
    new Spacer(mainDiv, true)
    new ToolButton(mainDiv, "redo", false, '<i class="fa fa-repeat" aria-hidden="true"></i>', true)
    new ToolButton(mainDiv, "undo", false, '<i class="fa fa-undo" aria-hidden="true"></i>', true)
    //new Spacer(mainDiv, true)
  }
}
